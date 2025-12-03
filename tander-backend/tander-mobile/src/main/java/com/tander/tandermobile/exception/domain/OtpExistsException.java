package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when an OTP (One-Time Password) already exists in the system.
 */
public class OtpExistsException extends RuntimeException {

    /**
     * Constructs a new OtpExistsException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public OtpExistsException(String message) {
        super(message);
    }
}
