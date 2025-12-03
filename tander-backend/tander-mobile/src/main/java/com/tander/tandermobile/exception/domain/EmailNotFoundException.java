package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when an email address is not found in the system.
 */
public class EmailNotFoundException extends RuntimeException {

    /**
     * Constructs a new EmailNotFoundException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public EmailNotFoundException(String message) {
        super(message);
    }
}
