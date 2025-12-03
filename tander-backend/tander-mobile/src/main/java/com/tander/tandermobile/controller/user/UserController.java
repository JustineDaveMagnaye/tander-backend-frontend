package com.tander.tandermobile.controller.user;

import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.dto.register.Register;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.domain.user.principal.UserPrincipal;
import com.tander.tandermobile.exception.domain.*;
import com.tander.tandermobile.service.user.UserService;
import com.tander.tandermobile.utils.security.jwt.provider.token.JWTTokenProvider;
import jakarta.mail.MessagingException;
import oracle.jdbc.proxy.annotation.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private AuthenticationManager authenticationManager;
    private JWTTokenProvider jwtTokenProvider;

    /**
     * Constructs a new UserController with the provided services.
     *
     * @param userService           service handling user operations
     * @param authenticationManager handles authentication
     * @param jwtTokenProvider      provides JWT token
     */
    @Autowired
    public UserController(UserService userService, AuthenticationManager authenticationManager, JWTTokenProvider jwtTokenProvider) {
        this.userService = userService;
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
    public ResponseEntity<String> completeProfile(
            @RequestParam String username,
            @RequestBody Profile profile,
            @RequestParam(defaultValue = "true") boolean markAsComplete) throws UserNotFoundException {
        User user = userService.completeProfile(username, profile, markAsComplete);
        String message = markAsComplete
            ? "Profile completed successfully. Please proceed to ID verification."
            : "Profile saved successfully.";
        return new ResponseEntity<>(message, null, HttpStatus.OK);
    }

    /**
     * Phase 3 Registration: Verifies user ID.
     *
     * @param username the username of the user to verify
     * @return success message indicating phase 3 completion
     * @throws UserNotFoundException if user is not found
     */
    @PostMapping("/verify-id")
    public ResponseEntity<String> verifyId(@RequestParam String username) throws UserNotFoundException {
        User user = userService.verifyId(username);
        return new ResponseEntity<>("ID verification completed successfully. You can now login.", null, HttpStatus.OK);
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
