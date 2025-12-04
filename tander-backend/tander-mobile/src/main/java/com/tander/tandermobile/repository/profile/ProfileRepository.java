package com.tander.tandermobile.repository.profile;

import com.tander.tandermobile.domain.profle.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for Profile entity.
 * Provides CRUD operations for user profiles.
 */
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    /**
     * Finds a profile by its ID.
     *
     * @param id the ID of the profile
     * @return the profile if found, null otherwise
     */
    Profile findById(long id);
}
