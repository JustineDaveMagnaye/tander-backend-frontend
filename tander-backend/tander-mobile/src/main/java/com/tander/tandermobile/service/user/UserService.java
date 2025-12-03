package com.tander.tandermobile.service.user;


import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.dto.register.Register;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.exception.domain.*;
import jakarta.mail.MessagingException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

/**
 * Service interface for managing user operations, providing methods for registration,
 * password reset, OTP verification, and username retrieval.
 */
public interface UserService {
    /**
     * Finds a user by their username.
     *
     * @param username the username of the user
     * @return the user with the specified username
     */
    User findUserByUsername(String username);

    /**
     * Phase 1 registration: Creates user account with username, email, and password only.
     *
     * @param register registration data containing username, email, and password
     * @return the created user with profileCompleted set to false
     * @throws UsernameExistsException if username already exists
     * @throws EmailExistsException if email already exists
     */
    User register(Register register) throws UsernameExistsException, EmailExistsException, PersonExistsException;

    /**
     * Phase 2 registration: Completes user profile with personal information.
     *
     * @param username the username of the user completing their profile
     * @param profile the profile information to be added
     * @return the updated user with profileCompleted set to true
     * @throws UserNotFoundException if user is not found
     */
    User completeProfile(String username, Profile profile) throws UserNotFoundException;
}
