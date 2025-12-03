package com.tander.tandermobile.exception.domain;

/**
 * This exception is thrown when a person already exists in the system.
 */
public class PersonExistsException extends RuntimeException {

    /**
     * Constructs a new PersonExistsException with a message.
     *
     * @param message message explaining the reason for the exception
     */
    public PersonExistsException(String message) {
        super(message);
    }
}
