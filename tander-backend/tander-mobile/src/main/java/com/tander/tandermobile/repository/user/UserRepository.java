package com.tander.tandermobile.repository.user;

import com.tander.tandermobile.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * An interface to the user repository.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their username.
     *
     * @param username username of the user
     * @return username
     */
    User findUserByUsername(String username);

    /**
     * Checks if a user exists with username.
     *
     * @param username the username of the user
     * @return user with username
     */
    boolean existsUserByUsername(String username);

    /**
     * Finds user by their otp.
     *
     * @param otp  OTP with the user
     * @return otp
     */
    User findUserByOtp(String otp);

    /**
     * Finds all users who have not completed their profile registration (phase 2).
     * These are users who completed phase 1 but haven't added profile information.
     *
     * @return list of users with incomplete profiles
     */
    @Query("SELECT u FROM login u WHERE u.profileCompleted = false AND u.softDeletedAt IS NULL")
    List<User> findIncompleteProfileUsers();

}
