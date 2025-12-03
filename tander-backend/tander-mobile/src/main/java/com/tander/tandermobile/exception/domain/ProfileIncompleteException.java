package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when a user attempts to login but hasn't completed their profile (phase 2 registration).
 */
public class ProfileIncompleteException extends RuntimeException {

    /**
     * Constructs a new ProfileIncompleteException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public ProfileIncompleteException(String message) {
        super(message);
    }
}
