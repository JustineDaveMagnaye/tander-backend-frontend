package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when a user is not found in the system.
 */
public class UserNotFoundException extends RuntimeException {

    /**
     * Constructs a new UserNotFoundException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public UserNotFoundException(String message) {
        super(message);
    }
}
