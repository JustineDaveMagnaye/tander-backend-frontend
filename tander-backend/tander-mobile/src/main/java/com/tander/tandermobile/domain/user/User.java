package com.tander.tandermobile.domain.user;

import com.tander.tandermobile.domain.profle.Profile;
import com.tander.tandermobile.utils.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
/**
 * Represents the user entity.
 */
@Entity(name = "login")
@Data
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false, updatable = false)
    private Long id;
    private String username;
    private String password;
    private String email;
    private Date lastLoginDate;
    private Date joinDate;
    private String role;
    private String otp;

    @Column(name = "authorities", nullable = false)
    @Convert(converter = StringListConverter.class)
    private List<String> authorities = new ArrayList<>();

    private Boolean isActive;
    private Boolean isLocked;

    /**
     * Indicates if the user has completed profile registration (phase 2).
     * false = phase 1 only (basic account created)
     * true = phase 2 completed (profile information added)
     * null = legacy records or uninitialized state (treated as false)
     */
    @Column(name = "profile_completed", nullable = true)
    private Boolean profileCompleted = false;

    /**
     * Timestamp for soft delete mechanism.
     * If phase 1 is completed but profile is not completed within 7 days,
     * this timestamp is set and the account is considered soft deleted.
     */
    private Date softDeletedAt;

    /**
     * One-to-one relationship with Profile entity
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", referencedColumnName = "id")
    private Profile profile;
}
