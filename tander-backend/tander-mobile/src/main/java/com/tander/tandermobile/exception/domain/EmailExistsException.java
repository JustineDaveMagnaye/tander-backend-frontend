package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when an email address already exists in the system.
 */
public class EmailExistsException extends RuntimeException {

    /**
     * Constructs a new EmailExistsException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public EmailExistsException(String message) {
        super(message);
    }
}
