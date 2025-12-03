package com.tander.tandermobile.utils.security.enumeration;

import static com.tander.tandermobile.utils.security.constant.Authority.*;

/**
 * Enum representing the different roles in the system and their associated authorities.
 */
public enum Role {

    ROLE_USER(USER_AUTHORITIES);

    /** Authorities associated with the role. */
    private final String[] authorities;

    /**
     * Constructor for the Role enum.
     *
     * @param authorities authorities associated with the role
     */
    Role(String... authorities) {
        this.authorities = authorities;
    }
    /**
     * Get the authorities associated with the role.
     *
     * @return array of authorities
     */
    public String[] getAuthorities() {
        return authorities;
    }
}
