package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when a username already exists in the system.
 */
public class UsernameExistsException extends RuntimeException {

    /**
     * Constructs a new UsernameExistsException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public UsernameExistsException(String message) {
        super(message);
    }
}
