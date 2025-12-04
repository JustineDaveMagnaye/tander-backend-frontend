package com.tander.tandermobile.controller.user;

import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.dto.register.Register;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.domain.user.principal.UserPrincipal;
import com.tander.tandermobile.exception.domain.*;
import com.tander.tandermobile.service.ratelimit.RateLimitService;
import com.tander.tandermobile.service.recaptcha.RecaptchaService;
import com.tander.tandermobile.service.user.UserService;
import com.tander.tandermobile.utils.security.jwt.provider.token.JWTTokenProvider;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import oracle.jdbc.proxy.annotation.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.tander.tandermobile.utils.security.constant.SecurityConstant.JWT_TOKEN_HEADER;

/**
 *RestController for managing user operations such as GET, POST, and PUT requests.
 */
@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final RateLimitService rateLimitService;
    private final RecaptchaService recaptchaService;
    private AuthenticationManager authenticationManager;
    private JWTTokenProvider jwtTokenProvider;

    /**
     * Constructs a new UserController with the provided services.
     *
     * @param userService           service handling user operations
     * @param rateLimitService      service for rate limiting
     * @param recaptchaService      service for reCAPTCHA verification
     * @param authenticationManager handles authentication
     * @param jwtTokenProvider      provides JWT token
     */
    @Autowired
    public UserController(UserService userService, RateLimitService rateLimitService,
                          RecaptchaService recaptchaService,
                          AuthenticationManager authenticationManager, JWTTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.rateLimitService = rateLimitService;
        this.recaptchaService = recaptchaService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Authenticates the user and generates a JWT token.
     *
     * @param user the user attempting to log in
     * @return the logged-in user's unique identifier (e.g., employee, student, external, or guest number)
     *         along with the JWT token in the response headers
     */
    /**
     * Phase 1 Registration: Creates basic user account with username, email, and password.
     *
     * @param register the registration data containing username, email, and password
     * @return success message indicating phase 1 completion
     * @throws UsernameExistsException if username already exists
     * @throws EmailExistsException if email already exists
     * @throws RegisterNotFoundException if register data is null
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Register register) throws UsernameExistsException, EmailExistsException, PersonExistsException {
        if(register == null){
            throw new RegisterNotFoundException("There is no register data provided.");
        }
        User registerUser = userService.register(register);
        return new ResponseEntity<>("Phase 1 registration completed. Please complete your profile.", null, HttpStatus.CREATED);
    }

    /**
     * Phase 2 Registration: Completes user profile with personal information.
     *
     * @param username the username of the user
     * @param profile the profile information
     * @param markAsComplete whether to mark profile as complete (default: true)
     * @return success message indicating phase 2 completion
     * @throws UserNotFoundException if user is not found
     */
    @PostMapping("/complete-profile")
    public ResponseEntity<?> completeProfile(
            @RequestParam String username,
            @RequestBody Profile profile,
            @RequestParam(defaultValue = "true") boolean markAsComplete) throws UserNotFoundException {
        User user = userService.completeProfile(username, profile, markAsComplete);

        if (markAsComplete) {
            // Return verification token for ID verification phase
            Map<String, Object> response = Map.of(
                "message", "Profile completed successfully. Please proceed to ID verification.",
                "verificationToken", user.getVerificationToken() != null ? user.getVerificationToken() : "",
                "username", username
            );
            return new ResponseEntity<>(response, null, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Profile saved successfully.", null, HttpStatus.OK);
        }
    }

    /**
     * Phase 3 Registration: Automated ID verification using OCR.
     * Extracts birthdate from ID photos, calculates age, and auto-approves if age >= 60.
     * Protected by: rate limiting + invisible reCAPTCHA v3 (senior-friendly, no interaction).
     *
     * @param username the username of the user to verify
     * @param idPhotoFront front photo of government-issued ID (required)
     * @param idPhotoBack back photo of ID (optional)
     * @param verificationToken verification token from phase 2 (optional for backward compatibility)
     * @param recaptchaToken reCAPTCHA v3 token from frontend (optional, defaults to enabled)
     * @param request HTTP request to extract IP address
     * @return verification result message
     */
    @PostMapping(value = "/verify-id", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> verifyId(
            @RequestParam String username,
            @RequestParam("idPhotoFront") org.springframework.web.multipart.MultipartFile idPhotoFront,
            @RequestParam(value = "idPhotoBack", required = false) org.springframework.web.multipart.MultipartFile idPhotoBack,
            @RequestParam(value = "verificationToken", required = false) String verificationToken,
            @RequestParam(value = "recaptchaToken", required = false) String recaptchaToken,
            HttpServletRequest request) {

        try {
            // 1. Rate limiting check
            String ipAddress = getClientIpAddress(request);
            if (!rateLimitService.allowRequest(ipAddress, "/user/verify-id")) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("status", "error", "message", "Rate limit exceeded. Please try again later."));
            }

            // 2. reCAPTCHA verification
            if (recaptchaService.isEnabled() && !recaptchaService.verifyToken(recaptchaToken, "verify_id")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("status", "error", "message", "Bot detection failed. Please try again."));
            }

            // 3. Process ID verification
            String result = userService.verifyId(username, idPhotoFront, idPhotoBack, verificationToken);

            // Success response
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", result
            ));

        } catch (com.tander.tandermobile.exception.IdVerificationException e) {
            // Return structured error message from custom exception
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            // Catch-all for unexpected errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }


    /**
     * Extracts client IP address from HTTP request, handling X-Forwarded-For header.
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Authenticates the user and generates a JWT token.
     * Checks if user has completed profile registration (phase 2).
     *
     * @param user the user attempting to log in
     * @return the logged-in user's unique identifier (e.g., employee, student, external, or guest number)
     *         along with the JWT token in the response headers
     * @throws ProfileIncompleteException if user hasn't completed profile registration
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        authenticate(user.getUsername(), user.getPassword());

        User loginUser = userService.findUserByUsername(user.getUsername());

        // Check if account was soft deleted
        if (loginUser.getSoftDeletedAt() != null) {
            throw new UserNotFoundException("Your account has expired. Please register again.");
        }

        // Check if user has completed profile registration (phase 2)
        // Treat null as false (legacy records or incomplete profile)
        if (!Boolean.TRUE.equals(loginUser.getProfileCompleted())) {
            // Return structured error response with profileCompleted status
            Map<String, Object> errorResponse = Map.of(
                "message", "Please complete your profile registration before logging in.",
                "profileCompleted", false,
                "username", loginUser.getUsername()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
        }

        // Check if user has completed ID verification (phase 3)
        // Treat null as false (legacy records or unverified accounts)
        if (!Boolean.TRUE.equals(loginUser.getIdVerified())) {
            // Return structured error response with idVerified status
            Map<String, Object> errorResponse = Map.of(
                "message", "Please complete ID verification before logging in. You must be 60+ years old.",
                "idVerified", false,
                "idVerificationStatus", loginUser.getIdVerificationStatus() != null ? loginUser.getIdVerificationStatus() : "PENDING",
                "username", loginUser.getUsername()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
        }

        UserPrincipal userPrincipal = new UserPrincipal(loginUser);
        HttpHeaders jwtHeaders = getJwtHeader(userPrincipal);
        return new ResponseEntity<>("Login Successfully!", jwtHeaders, HttpStatus.OK);
    }


    private void authenticate(String username, String password) {
        this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }

    private HttpHeaders getJwtHeader(UserPrincipal userPrincipal) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(JWT_TOKEN_HEADER, jwtTokenProvider.generateJwtToken(userPrincipal));
        return headers;
    }

}
