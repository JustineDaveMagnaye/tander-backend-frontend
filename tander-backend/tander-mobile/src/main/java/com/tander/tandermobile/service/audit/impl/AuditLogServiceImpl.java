package com.tander.tandermobile.service.audit.impl;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditLog;
import com.tander.tandermobile.domain.audit.AuditStatus;
import com.tander.tandermobile.repository.audit.AuditLogRepository;
import com.tander.tandermobile.service.audit.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogServiceImpl.class);

    private final AuditLogRepository auditLogRepository;

    @Autowired
    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Truncates a string to the specified max length to prevent database constraint violations.
     * Returns null if input is null.
     */
    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, maxLength);
    }

    @Override
    @Async
    public void logEvent(AuditEventType eventType, AuditStatus status, Long userId, String username, String description) {
        logEvent(eventType, status, userId, username, description, null, null);
    }

    @Override
    @Async
    public void logEvent(AuditEventType eventType, AuditStatus status, Long userId, String username, String description,
                         String ipAddress, String userAgent) {
        logEvent(eventType, status, userId, username, description, ipAddress, userAgent, null);
    }

    @Override
    @Async
    public void logEvent(AuditEventType eventType, AuditStatus status, Long userId, String username, String description,
                         String ipAddress, String userAgent, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .username(truncate(username, 255))
                    .eventType(eventType)
                    .status(status)
                    .description(truncate(description, 1000))
                    .ipAddress(truncate(ipAddress, 45))
                    .userAgent(truncate(userAgent, 500))
                    .errorMessage(truncate(errorMessage, 1000))
                    .build();

            auditLogRepository.save(auditLog);

            LOGGER.info("Audit log created: {} - {} - User: {} - Status: {}",
                    eventType, truncate(description, 100), username, status);
        } catch (Exception e) {
            LOGGER.error("Failed to create audit log for event: {} - User: {} - Error: {}",
                    eventType, username, e.getMessage());
        }
    }

    @Override
    @Async
    public void logEventWithDetails(AuditEventType eventType, AuditStatus status, Long userId, String username,
                                     String entityType, Long entityId, String description, String ipAddress,
                                     String userAgent, String oldValue, String newValue, String errorMessage,
                                     String sessionId) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .username(truncate(username, 255))
                    .eventType(eventType)
                    .status(status)
                    .entityType(truncate(entityType, 100))
                    .entityId(entityId)
                    .description(truncate(description, 1000))
                    .ipAddress(truncate(ipAddress, 45))
                    .userAgent(truncate(userAgent, 500))
                    .oldValue(oldValue) // CLOB - no length limit
                    .newValue(newValue) // CLOB - no length limit
                    .errorMessage(truncate(errorMessage, 1000))
                    .sessionId(truncate(sessionId, 255))
                    .build();

            auditLogRepository.save(auditLog);

            LOGGER.info("Detailed audit log created: {} - {} - User: {} - Entity: {} - Status: {}",
                    eventType, truncate(description, 100), username, entityType, status);
        } catch (Exception e) {
            LOGGER.error("Failed to create detailed audit log for event: {} - User: {} - Error: {}",
                    eventType, username, e.getMessage());
        }
    }

    @Override
    public AuditLog createAuditLog(AuditEventType eventType, AuditStatus status, Long userId, String username) {
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(truncate(username, 255))
                .eventType(eventType)
                .status(status)
                .build();
        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLog> getAuditLogsByUserId(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    @Override
    public List<AuditLog> getAuditLogsByUsername(String username) {
        return auditLogRepository.findByUsername(username);
    }

    @Override
    public List<AuditLog> getAuditLogsByEventType(AuditEventType eventType) {
        return auditLogRepository.findByEventType(eventType);
    }

    @Override
    public List<AuditLog> getAuditLogsByUserIdAndDateRange(Long userId, Date startDate, Date endDate) {
        return auditLogRepository.findByUserIdAndDateRange(userId, startDate, endDate);
    }

    @Override
    public List<AuditLog> getFailedEvents(Date since) {
        return auditLogRepository.findFailedEventsSince(AuditStatus.FAILURE, since);
    }
}
