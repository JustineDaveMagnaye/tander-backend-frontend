package com.tander.tandermobile.service.user.impl;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditStatus;
import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.dto.register.Register;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.domain.user.principal.UserPrincipal;
import com.tander.tandermobile.exception.domain.*;
import com.tander.tandermobile.repository.user.UserRepository;
import com.tander.tandermobile.repository.profile.ProfileRepository;
import com.tander.tandermobile.service.audit.AuditLogService;
import com.tander.tandermobile.service.email.EmailService;
import com.tander.tandermobile.service.login.attempt.LoginAttemptService;
import com.tander.tandermobile.service.user.UserService;
import com.tander.tandermobile.service.verification.IdVerificationService;
import com.tander.tandermobile.utils.security.enumeration.Role;
import org.springframework.web.multipart.MultipartFile;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

import static com.tander.tandermobile.utils.security.enumeration.Role.*;

/**
 *This  class handles user-related tasks such as registration, authentication, password recovery, and  verification One-Time Password
 */
@Service
@Transactional
@Qualifier("userDetailsService")
public class UserServiceImpl implements UserService, UserDetailsService {

    private final Logger LOGGER = LoggerFactory.getLogger(getClass());
    private UserRepository userRepository;
    private ProfileRepository profileRepository;
    private BCryptPasswordEncoder passwordEncoder;
    private LoginAttemptService loginAttemptService;
    private EmailService emailService;
    private AuditLogService auditLogService;
    private IdVerificationService idVerificationService;

    /**
     * Constructor for injecting UserService and EmailService.
     *
     * @param userRepository  the service used for user management
     * @param profileRepository the repository used for profile management
     * @param passwordEncoder the service used for encrypting passwords
     * @param loginAttemptService the service used for managing login
     * @param emailService the service used for sending emails
     * @param auditLogService the service used for audit logging
     * @param idVerificationService the service used for automated ID verification
     */
    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           ProfileRepository profileRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           LoginAttemptService loginAttemptService,
                           EmailService emailService,
                           AuditLogService auditLogService,
                           IdVerificationService idVerificationService) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptService = loginAttemptService;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
        this.idVerificationService = idVerificationService;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = this.userRepository.findUserByUsername(username);
        if (user == null) {
            LOGGER.error("Username not found...");
            throw new UsernameNotFoundException("Username not found.");
        }
        validateLoginAttempt(user);
        user.setLastLoginDate(new Date());
        this.userRepository.save(user);
        UserPrincipal userPrincipal = new UserPrincipal(user);
        LOGGER.info("User information found...");
        return userPrincipal;
    }
    private void validateLoginAttempt(User user) {
        if (Boolean.TRUE.equals(user.getIsLocked())) {
            loginAttemptService.evictUserFromLoginAttemptCache(user.getUsername());
        } else if (loginAttemptService.hasExceededMaxAttempts(user.getUsername())) {
            user.setIsLocked(true);

            // Log account lockout
            auditLogService.logEvent(
                    AuditEventType.ACCOUNT_LOCKED,
                    AuditStatus.BLOCKED,
                    user.getId(),
                    user.getUsername(),
                    "Account locked due to exceeded login attempts"
            );
        }
    }
    @Override
    public User findUserByUsername(String username) {
        return this.userRepository.findUserByUsername(username);
    }

    @Override
    public User register(Register register) throws UsernameExistsException, EmailExistsException, PersonExistsException {
        try {
            validateNewUsernameAndEmail(StringUtils.EMPTY, register.getUsername(), register.getEmail());

            User newUser = new User();
            newUser.setUsername(register.getUsername());
            newUser.setPassword(passwordEncoder.encode(register.getPassword()));
            newUser.setEmail(register.getEmail());
            newUser.setJoinDate(new Date());
            newUser.setIsActive(true);
            newUser.setIsLocked(false);
            newUser.setRole(ROLE_USER.name());
            newUser.setAuthorities(List.of(ROLE_USER.getAuthorities()));
            newUser.setProfileCompleted(false); // Phase 1 only - profile not completed yet

            User savedUser = userRepository.save(newUser);
            LOGGER.info("Phase 1 registration completed for user: {}", newUser.getUsername());

            // Log successful registration
            auditLogService.logEvent(
                    AuditEventType.REGISTRATION_PHASE1_SUCCESS,
                    AuditStatus.SUCCESS,
                    savedUser.getId(),
                    savedUser.getUsername(),
                    "Phase 1 registration completed successfully"
            );

            return savedUser;
        } catch (UsernameExistsException | EmailExistsException | PersonExistsException e) {
            // Log failed registration
            auditLogService.logEvent(
                    AuditEventType.REGISTRATION_PHASE1_FAILURE,
                    AuditStatus.FAILURE,
                    null,
                    register.getUsername(),
                    "Phase 1 registration failed: " + e.getMessage(),
                    null,
                    null,
                    e.getMessage()
            );
            throw e;
        }
    }

    @Override
    public User completeProfile(String username, Profile profile, boolean markAsComplete) throws UserNotFoundException {
        try {
            User user = findUserByUsername(username);
            if (user == null) {
                LOGGER.error("User not found for profile completion: {}", username);
                throw new UserNotFoundException("User not found: " + username);
            }

            if (user.getSoftDeletedAt() != null) {
                LOGGER.error("Cannot complete profile for soft-deleted user: {}", username);
                throw new UserNotFoundException("User account has expired. Please register again.");
            }

            // Check if user already has a profile
            Profile existingProfile = user.getProfile();
            Profile profileToSave;

            if (existingProfile != null) {
                // Update existing profile fields
                LOGGER.info("Updating existing profile (ID: {}) for user: {}", existingProfile.getId(), username);
                existingProfile.setFirstName(profile.getFirstName());
                existingProfile.setLastName(profile.getLastName());
                existingProfile.setMiddleName(profile.getMiddleName());
                existingProfile.setNickName(profile.getNickName());
                existingProfile.setAddress(profile.getAddress());
                existingProfile.setPhone(profile.getPhone());
                existingProfile.setEmail(profile.getEmail());
                existingProfile.setBirthDate(profile.getBirthDate());
                existingProfile.setAge(profile.getAge());
                existingProfile.setCountry(profile.getCountry());
                existingProfile.setCity(profile.getCity());
                existingProfile.setCivilStatus(profile.getCivilStatus());
                existingProfile.setHobby(profile.getHobby());
                profileToSave = existingProfile;
            } else {
                // Create new profile and link it to the user
                LOGGER.info("Creating new profile for user: {}", username);
                user.setProfile(profile);
                profileToSave = profile;
            }

            // ✅ Save the Profile entity first (generates ID if new)
            Profile savedProfile = profileRepository.save(profileToSave);

            // ✅ Link the saved profile to user and mark as complete
            user.setProfile(savedProfile);
            user.setProfileCompleted(true);

            // Generate verification token when profile is marked as complete
            // This token is required for ID verification to prevent spoofing
            if (markAsComplete) {
                String verificationToken = UUID.randomUUID().toString() + UUID.randomUUID().toString();
                user.setVerificationToken(verificationToken);
                LOGGER.info("Generated verification token for user: {}", username);
            }

            User updatedUser = userRepository.save(user);

            String action = markAsComplete ? "completed" : "updated";
            LOGGER.info("Profile {} for user: {}", action, username);

            // Log successful profile completion or update
            AuditEventType eventType = markAsComplete
                ? AuditEventType.REGISTRATION_PHASE2_SUCCESS
                : AuditEventType.PROFILE_UPDATE_SUCCESS;
            String description = markAsComplete
                ? "Phase 2 registration (profile completion) completed successfully"
                : "Profile information updated (partial save)";

            auditLogService.logEvent(
                    eventType,
                    AuditStatus.SUCCESS,
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    description
            );

            return updatedUser;
        } catch (UserNotFoundException e) {
            // Log failed profile completion
            auditLogService.logEvent(
                    AuditEventType.REGISTRATION_PHASE2_FAILURE,
                    AuditStatus.FAILURE,
                    null,
                    username,
                    "Phase 2 registration failed: " + e.getMessage(),
                    null,
                    null,
                    e.getMessage()
            );
            throw e;
        }
    }

    @Override
    public String verifyId(String username, MultipartFile idPhotoFront, MultipartFile idPhotoBack, String verificationToken) throws Exception {
        try {
            User user = findUserByUsername(username);
            if (user == null) {
                LOGGER.error("User not found for ID verification: {}", username);
                throw new UserNotFoundException("User not found: " + username);
            }

            if (user.getSoftDeletedAt() != null) {
                LOGGER.error("Cannot verify ID for soft-deleted user: {}", username);
                throw new UserNotFoundException("User account has expired. Please register again.");
            }

            // ✅ REMOVED profile completion check for senior-friendly UX
            // Allow ID verification even if profile not complete (easier for elderly users)
            // They can complete steps in any order
            if (!Boolean.TRUE.equals(user.getProfileCompleted())) {
                LOGGER.warn("⚠️ User {} uploading ID without completing profile first - allowing for flexibility", username);
            }

            // Validate verification token to prevent ID spoofing
            if (verificationToken != null && !verificationToken.isEmpty()) {
                if (user.getVerificationToken() == null || !user.getVerificationToken().equals(verificationToken)) {
                    LOGGER.error("Invalid verification token for user: {}", username);
                    throw new Exception("Invalid verification token. Please complete profile registration again.");
                }
                LOGGER.info("✅ Verification token validated for user: {}", username);
            } else {
                LOGGER.warn("⚠️ ID verification proceeding without token validation for user: {} (backward compatibility)", username);
            }

            // Validate that at least front photo is provided
            if (idPhotoFront == null || idPhotoFront.isEmpty()) {
                throw new Exception("Front photo of ID is required");
            }

            LOGGER.info("🚀 Starting automated ID verification for user: {}", username);

            // Call ID verification service (OCR + age validation)
            String result = idVerificationService.verifyUserAge(user, idPhotoFront, idPhotoBack);

            LOGGER.info("✅ ID verification completed for user: {}", username);

            // Log successful ID verification
            auditLogService.logEvent(
                    AuditEventType.REGISTRATION_PHASE3_SUCCESS,
                    AuditStatus.SUCCESS,
                    user.getId(),
                    user.getUsername(),
                    "Phase 3 registration (ID verification) completed successfully via automated OCR"
            );

            return result;
        } catch (Exception e) {
            LOGGER.error("❌ ID verification failed for user {}: {}", username, e.getMessage());

            // Log failed ID verification
            auditLogService.logEvent(
                    AuditEventType.REGISTRATION_PHASE3_FAILURE,
                    AuditStatus.FAILURE,
                    null,
                    username,
                    "Phase 3 registration (ID verification) failed: " + e.getMessage(),
                    null,
                    null,
                    e.getMessage()
            );
            throw e;
        }
    }

    private void validateNewUsernameAndEmail(String currentUsername, String newUsername, String newEmail)
            throws UsernameExistsException, EmailExistsException {
        if (StringUtils.isNotBlank(currentUsername)) {
            User currentUser = findUserByUsername(currentUsername);
            if (currentUser == null) {
                throw new UserNotFoundException("User not found by username: " + currentUsername);
            }

            User userByNewUsername = findUserByUsername(newUsername);
            if (userByNewUsername != null && !currentUser.getId().equals(userByNewUsername.getId())) {
                throw new UsernameExistsException("Username already exists");
            }
        } else {
            User userByUsername = findUserByUsername(newUsername);
            if (userByUsername != null) {
                throw new UsernameExistsException("Username already exists");
            }
        }
    }
}

