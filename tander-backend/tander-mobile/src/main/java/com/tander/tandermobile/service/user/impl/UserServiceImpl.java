package com.tander.tandermobile.service.user.impl;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditStatus;
import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.dto.register.Register;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.domain.user.principal.UserPrincipal;
import com.tander.tandermobile.exception.domain.*;
import com.tander.tandermobile.repository.user.UserRepository;
import com.tander.tandermobile.service.audit.AuditLogService;
import com.tander.tandermobile.service.email.EmailService;
import com.tander.tandermobile.service.login.attempt.LoginAttemptService;
import com.tander.tandermobile.service.user.UserService;
import com.tander.tandermobile.utils.security.enumeration.Role;
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
    private BCryptPasswordEncoder passwordEncoder;
    private LoginAttemptService loginAttemptService;
    private EmailService emailService;
    private AuditLogService auditLogService;

    /**
     * Constructor for injecting UserService and EmailService.
     *
     * @param userRepository  the service used for user management
     * @param passwordEncoder the service used for encrypting passwords
     * @param loginAttemptService the service used for managing login
     * @param emailService the service used for sending emails
     * @param auditLogService the service used for audit logging
     */
    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           LoginAttemptService loginAttemptService,
                           EmailService emailService,
                           AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptService = loginAttemptService;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
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
        if (user.isLocked()) {
            loginAttemptService.evictUserFromLoginAttemptCache(user.getUsername());
        } else if (loginAttemptService.hasExceededMaxAttempts(user.getUsername())) {
            user.setLocked(true);

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
            newUser.setActive(true);
            newUser.setLocked(false);
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
    public User completeProfile(String username, Profile profile) throws UserNotFoundException {
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

            // Set profile information
            user.setProfile(profile);
            user.setProfileCompleted(true);

            User updatedUser = userRepository.save(user);
            LOGGER.info("Phase 2 registration completed for user: {}", username);

            // Log successful profile completion
            auditLogService.logEvent(
                    AuditEventType.REGISTRATION_PHASE2_SUCCESS,
                    AuditStatus.SUCCESS,
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    "Phase 2 registration (profile completion) completed successfully"
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

