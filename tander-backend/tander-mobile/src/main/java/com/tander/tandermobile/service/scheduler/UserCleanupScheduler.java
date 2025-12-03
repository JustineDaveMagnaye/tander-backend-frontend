package com.tander.tandermobile.service.scheduler;

import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Scheduled service to clean up incomplete user registrations.
 * Soft deletes users who completed phase 1 but haven't completed phase 2 within 7 days.
 */
@Service
public class UserCleanupScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserCleanupScheduler.class);
    private static final long SEVEN_DAYS_IN_MILLIS = TimeUnit.DAYS.toMillis(7);

    private final UserRepository userRepository;

    @Autowired
    public UserCleanupScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Runs daily at midnight to check for incomplete registrations older than 7 days.
     * Soft deletes accounts that have completed phase 1 but not phase 2.
     */
    @Scheduled(cron = "0 0 0 * * ?") // Runs at midnight every day
    public void softDeleteIncompleteRegistrations() {
        LOGGER.info("Running scheduled task to soft delete incomplete registrations");

        List<User> incompleteUsers = userRepository.findIncompleteProfileUsers();
        Date now = new Date();
        int softDeletedCount = 0;

        for (User user : incompleteUsers) {
            if (user.getSoftDeletedAt() == null) {
                long daysSinceJoin = now.getTime() - user.getJoinDate().getTime();

                if (daysSinceJoin >= SEVEN_DAYS_IN_MILLIS) {
                    user.setSoftDeletedAt(now);
                    user.setIsActive(false);
                    userRepository.save(user);
                    softDeletedCount++;
                    LOGGER.info("Soft deleted user '{}' due to incomplete profile after 7 days", user.getUsername());
                }
            }
        }

        LOGGER.info("Completed soft delete task. {} users soft deleted", softDeletedCount);
    }
}
