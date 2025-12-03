package com.tander.tandermobile.service.audit;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditLog;
import com.tander.tandermobile.domain.audit.AuditStatus;

import java.util.Date;
import java.util.List;

public interface AuditLogService {

    void logEvent(AuditEventType eventType, AuditStatus status, Long userId, String username, String description);

    void logEvent(AuditEventType eventType, AuditStatus status, Long userId, String username, String description,
                  String ipAddress, String userAgent);

    void logEvent(AuditEventType eventType, AuditStatus status, Long userId, String username, String description,
                  String ipAddress, String userAgent, String errorMessage);

    void logEventWithDetails(AuditEventType eventType, AuditStatus status, Long userId, String username,
                             String entityType, Long entityId, String description, String ipAddress,
                             String userAgent, String oldValue, String newValue, String errorMessage,
                             String sessionId);

    AuditLog createAuditLog(AuditEventType eventType, AuditStatus status, Long userId, String username);

    List<AuditLog> getAuditLogsByUserId(Long userId);

    List<AuditLog> getAuditLogsByUsername(String username);

    List<AuditLog> getAuditLogsByEventType(AuditEventType eventType);

    List<AuditLog> getAuditLogsByUserIdAndDateRange(Long userId, Date startDate, Date endDate);

    List<AuditLog> getFailedEvents(Date since);
}
