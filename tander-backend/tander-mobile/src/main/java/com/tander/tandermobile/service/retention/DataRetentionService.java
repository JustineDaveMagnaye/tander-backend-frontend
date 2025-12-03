package com.tander.tandermobile.service.retention;

import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * GDPR-compliant data retention service.
 * Auto-deletes old ID photos and soft-deleted accounts.
 * 100% FREE - uses Spring's built-in task scheduler.
 *
 * Runs daily at 2 AM to clean up old data.
 */
@Service
public class DataRetentionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataRetentionService.class);

    @Value("${data-retention.delete-after-verification}")
    private boolean deleteAfterVerification;

    @Value("${data-retention.retention-days}")
    private int retentionDays;

    @Value("${data-retention.delete-soft-deleted-accounts-days}")
    private int deleteSoftDeletedAccountsDays;

    @Autowired
    private UserRepository userRepository;

    /**
     * Scheduled task: Runs daily at 2 AM to clean up old data.
     * Cron format: second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2:00 AM
    @Transactional
    public void cleanupOldData() {
        LOGGER.info("🧹 [DATA RETENTION] Starting scheduled cleanup job...");

        try {
            int deletedPhotos = deleteOldIdPhotos();
            int deletedAccounts = deleteSoftDeletedAccounts();

            LOGGER.info("✅ [DATA RETENTION] Cleanup completed: {} ID photos deleted, {} accounts deleted",
                    deletedPhotos, deletedAccounts);

        } catch (Exception e) {
            LOGGER.error("❌ [DATA RETENTION] Cleanup failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Deletes ID photos older than retention period.
     * Only deletes if verification was successful and retention period has passed.
     */
    public int deleteOldIdPhotos() {
        if (!deleteAfterVerification) {
            LOGGER.debug("ID photo deletion is disabled in configuration");
            return 0;
        }

        LOGGER.info("🗑️  Deleting ID photos older than {} days...", retentionDays);

        // Calculate cutoff date
        Date cutoffDate = new Date(System.currentTimeMillis() - TimeUnit.DAYS.toMillis(retentionDays));

        // Find users with verified IDs older than retention period
        List<User> users = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getIdVerified()))
                .filter(u -> u.getVerifiedAt() != null && u.getVerifiedAt().before(cutoffDate))
                .filter(u -> u.getIdPhotoFrontUrl() != null || u.getIdPhotoBackUrl() != null)
                .toList();

        int deletedCount = 0;

        for (User user : users) {
            try {
                // Delete front photo
                if (user.getIdPhotoFrontUrl() != null) {
                    if (deleteFile(user.getIdPhotoFrontUrl())) {
                        user.setIdPhotoFrontUrl(null);
                        deletedCount++;
                    }
                }

                // Delete back photo
                if (user.getIdPhotoBackUrl() != null) {
                    if (deleteFile(user.getIdPhotoBackUrl())) {
                        user.setIdPhotoBackUrl(null);
                        deletedCount++;
                    }
                }

                userRepository.save(user);
                LOGGER.debug("Deleted ID photos for user: {}", user.getUsername());

            } catch (Exception e) {
                LOGGER.error("Failed to delete ID photos for user {}: {}", user.getUsername(), e.getMessage());
            }
        }

        LOGGER.info("✅ Deleted {} ID photos from {} users", deletedCount, users.size());
        return deletedCount;
    }

    /**
     * Permanently deletes soft-deleted accounts and their data after grace period.
     */
    public int deleteSoftDeletedAccounts() {
        LOGGER.info("🗑️  Deleting soft-deleted accounts older than {} days...", deleteSoftDeletedAccountsDays);

        // Calculate cutoff date
        Date cutoffDate = new Date(System.currentTimeMillis() - TimeUnit.DAYS.toMillis(deleteSoftDeletedAccountsDays));

        // Find soft-deleted accounts past grace period
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getSoftDeletedAt() != null && u.getSoftDeletedAt().before(cutoffDate))
                .toList();

        int deletedCount = 0;

        for (User user : users) {
            try {
                // Delete ID photos if exist
                if (user.getIdPhotoFrontUrl() != null) {
                    deleteFile(user.getIdPhotoFrontUrl());
                }
                if (user.getIdPhotoBackUrl() != null) {
                    deleteFile(user.getIdPhotoBackUrl());
                }

                // Delete user record
                userRepository.delete(user);
                deletedCount++;

                LOGGER.info("Permanently deleted user: {} (soft-deleted on: {})",
                        user.getUsername(), user.getSoftDeletedAt());

            } catch (Exception e) {
                LOGGER.error("Failed to delete user {}: {}", user.getUsername(), e.getMessage());
            }
        }

        LOGGER.info("✅ Permanently deleted {} soft-deleted accounts", deletedCount);
        return deletedCount;
    }

    /**
     * Deletes a file from the filesystem.
     */
    private boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                LOGGER.debug("Deleted file: {}", filePath);
                return true;
            }
            return false;
        } catch (IOException e) {
            LOGGER.error("Failed to delete file {}: {}", filePath, e.getMessage());
            return false;
        }
    }

    /**
     * Manual trigger for cleanup (useful for testing or admin operations).
     */
    public void manualCleanup() {
        LOGGER.info("🧹 [MANUAL TRIGGER] Starting manual cleanup...");
        cleanupOldData();
    }
}
