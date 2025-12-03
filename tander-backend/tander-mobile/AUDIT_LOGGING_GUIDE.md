# Audit Logging System - Implementation Guide

## Overview

This dating mobile app includes a comprehensive audit logging system that tracks all important user activities. The system is designed to log authentication events, user registration, and future features like chat messaging, video calls, and user connections.

## Architecture

### Components

1. **AuditLog Entity** (`domain/audit/AuditLog.java`)
   - Stores all audit log entries in the database
   - Fields: userId, username, eventType, status, ipAddress, userAgent, description, etc.

2. **AuditEventType Enum** (`domain/audit/AuditEventType.java`)
   - Defines all possible events that can be logged
   - Includes events for: authentication, registration, profile updates, chat, video calls, and connections

3. **AuditStatus Enum** (`domain/audit/AuditStatus.java`)
   - Defines the status of events: SUCCESS, FAILURE, PENDING, BLOCKED, ERROR

4. **AuditLogService** (`service/audit/AuditLogService.java`)
   - Centralized service for logging audit events
   - All log operations are asynchronous for better performance

5. **AuditLogRepository** (`repository/audit/AuditLogRepository.java`)
   - JPA repository for audit log database operations
   - Includes custom queries for filtering and reporting

## Currently Implemented Events

### Authentication Events
- **LOGIN_SUCCESS**: Logged when a user successfully logs in
- **LOGIN_FAILURE**: Logged when a login attempt fails (bad credentials)
- **ACCOUNT_LOCKED**: Logged when an account is locked due to too many failed attempts

### Registration Events
- **REGISTRATION_PHASE1_SUCCESS**: Logged when a user completes phase 1 registration (username/password)
- **REGISTRATION_PHASE1_FAILURE**: Logged when phase 1 registration fails
- **REGISTRATION_PHASE2_SUCCESS**: Logged when a user completes profile information
- **REGISTRATION_PHASE2_FAILURE**: Logged when profile completion fails

## Future Implementation - Chat Messaging

When you implement chat messaging features, use the audit logging system as follows:

### Example: Logging a Successful Chat Message

```java
@Service
public class ChatService {

    @Autowired
    private AuditLogService auditLogService;

    public ChatMessage sendMessage(Long senderId, Long receiverId, String message) {
        try {
            // Your chat message sending logic here
            ChatMessage chatMessage = // ... create and save chat message

            // Log successful chat message
            auditLogService.logEventWithDetails(
                AuditEventType.CHAT_MESSAGE_SENT,
                AuditStatus.SUCCESS,
                senderId,
                senderUsername,
                "ChatMessage",
                chatMessage.getId(),
                "Chat message sent successfully",
                ipAddress,
                userAgent,
                null,  // oldValue
                message,  // newValue
                null,  // errorMessage
                sessionId
            );

            return chatMessage;
        } catch (Exception e) {
            // Log failed chat message
            auditLogService.logEvent(
                AuditEventType.CHAT_MESSAGE_FAILED,
                AuditStatus.FAILURE,
                senderId,
                senderUsername,
                "Failed to send chat message",
                ipAddress,
                userAgent,
                e.getMessage()
            );
            throw e;
        }
    }

    public void deleteMessage(Long messageId, Long userId) {
        // Your delete logic here

        // Log message deletion
        auditLogService.logEventWithDetails(
            AuditEventType.CHAT_MESSAGE_DELETED,
            AuditStatus.SUCCESS,
            userId,
            username,
            "ChatMessage",
            messageId,
            "Chat message deleted",
            ipAddress,
            userAgent,
            oldMessage,  // The deleted message content
            null,  // newValue
            null,  // errorMessage
            sessionId
        );
    }
}
```

### Available Chat Event Types
- `CHAT_MESSAGE_SENT`: Successfully sent a message
- `CHAT_MESSAGE_RECEIVED`: Successfully received a message
- `CHAT_MESSAGE_FAILED`: Failed to send a message
- `CHAT_MESSAGE_DELETED`: Deleted a message
- `CHAT_CONVERSATION_STARTED`: Started a new conversation
- `CHAT_CONVERSATION_ENDED`: Ended a conversation

## Future Implementation - Video Calls

When you implement video call features:

### Example: Logging Video Call Events

```java
@Service
public class VideoCallService {

    @Autowired
    private AuditLogService auditLogService;

    public VideoCall initiateCall(Long callerId, Long receiverId) {
        try {
            // Your video call initiation logic here
            VideoCall call = // ... create video call

            // Log call initiation
            auditLogService.logEventWithDetails(
                AuditEventType.VIDEO_CALL_INITIATED,
                AuditStatus.SUCCESS,
                callerId,
                callerUsername,
                "VideoCall",
                call.getId(),
                "Video call initiated to " + receiverUsername,
                ipAddress,
                userAgent,
                null,
                null,
                null,
                sessionId
            );

            return call;
        } catch (Exception e) {
            // Log failed call initiation
            auditLogService.logEvent(
                AuditEventType.VIDEO_CALL_FAILED,
                AuditStatus.FAILURE,
                callerId,
                callerUsername,
                "Failed to initiate video call",
                ipAddress,
                userAgent,
                e.getMessage()
            );
            throw e;
        }
    }

    public void endCall(Long callId, Long userId, long durationSeconds) {
        // Your call ending logic here

        // Log call ended
        auditLogService.logEventWithDetails(
            AuditEventType.VIDEO_CALL_ENDED,
            AuditStatus.SUCCESS,
            userId,
            username,
            "VideoCall",
            callId,
            "Video call ended. Duration: " + durationSeconds + " seconds",
            ipAddress,
            userAgent,
            null,
            String.valueOf(durationSeconds),
            null,
            sessionId
        );
    }

    public void answerCall(Long callId, Long userId) {
        // Log when call is answered/connected
        auditLogService.logEventWithDetails(
            AuditEventType.VIDEO_CALL_CONNECTED,
            AuditStatus.SUCCESS,
            userId,
            username,
            "VideoCall",
            callId,
            "Video call connected",
            ipAddress,
            userAgent,
            null,
            null,
            null,
            sessionId
        );
    }

    public void rejectCall(Long callId, Long userId) {
        // Log rejected call
        auditLogService.logEventWithDetails(
            AuditEventType.VIDEO_CALL_REJECTED,
            AuditStatus.BLOCKED,
            userId,
            username,
            "VideoCall",
            callId,
            "Video call rejected by user",
            ipAddress,
            userAgent,
            null,
            null,
            null,
            sessionId
        );
    }
}
```

### Available Video Call Event Types
- `VIDEO_CALL_INITIATED`: User initiated a video call
- `VIDEO_CALL_CONNECTED`: Video call successfully connected
- `VIDEO_CALL_FAILED`: Video call failed to connect
- `VIDEO_CALL_ENDED`: Video call ended
- `VIDEO_CALL_REJECTED`: User rejected an incoming call
- `VIDEO_CALL_MISSED`: User missed an incoming call

## Future Implementation - Connections/Matching

When you implement swipe/match features:

### Example: Logging Match Events

```java
@Service
public class MatchingService {

    @Autowired
    private AuditLogService auditLogService;

    public void swipeRight(Long userId, Long targetUserId) {
        // Your swipe logic here

        // Log swipe right
        auditLogService.logEventWithDetails(
            AuditEventType.PROFILE_SWIPED_RIGHT,
            AuditStatus.SUCCESS,
            userId,
            username,
            "UserProfile",
            targetUserId,
            "User swiped right on profile: " + targetUsername,
            ipAddress,
            userAgent,
            null,
            String.valueOf(targetUserId),
            null,
            sessionId
        );

        // Check if it's a match
        if (isMatch(userId, targetUserId)) {
            auditLogService.logEvent(
                AuditEventType.MATCH_CREATED,
                AuditStatus.SUCCESS,
                userId,
                username,
                "Match created with: " + targetUsername,
                ipAddress,
                userAgent
            );
        }
    }

    public void swipeLeft(Long userId, Long targetUserId) {
        // Log swipe left
        auditLogService.logEventWithDetails(
            AuditEventType.PROFILE_SWIPED_LEFT,
            AuditStatus.SUCCESS,
            userId,
            username,
            "UserProfile",
            targetUserId,
            "User swiped left on profile: " + targetUsername,
            ipAddress,
            userAgent,
            null,
            String.valueOf(targetUserId),
            null,
            sessionId
        );
    }

    public void unmatch(Long userId, Long matchedUserId) {
        // Your unmatch logic here

        // Log unmatch
        auditLogService.logEvent(
            AuditEventType.UNMATCH,
            AuditStatus.SUCCESS,
            userId,
            username,
            "User unmatched with: " + matchedUsername,
            ipAddress,
            userAgent
        );
    }
}
```

### Available Connection Event Types
- `PROFILE_SWIPED_RIGHT`: User swiped right (like)
- `PROFILE_SWIPED_LEFT`: User swiped left (pass)
- `PROFILE_SUPER_LIKED`: User super-liked a profile
- `MATCH_CREATED`: Two users matched
- `MATCH_DELETED`: Match was deleted
- `UNMATCH`: User unmatched with another user

## Utility Methods

### Getting IP Address and User Agent

For controllers and request-based services, you can extract IP address and user agent from the HTTP request:

```java
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class YourController {

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    private String getUserAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }
}
```

## Querying Audit Logs

The `AuditLogRepository` provides several methods to query audit logs:

```java
// Get all logs for a specific user
List<AuditLog> userLogs = auditLogRepository.findByUserId(userId);

// Get all logs for a specific event type
List<AuditLog> loginLogs = auditLogRepository.findByEventType(AuditEventType.LOGIN_SUCCESS);

// Get logs for a user within a date range
List<AuditLog> userLogsInRange = auditLogRepository.findByUserIdAndDateRange(
    userId, startDate, endDate
);

// Get all failed events since a specific date
List<AuditLog> failedEvents = auditLogRepository.findFailedEventsSince(
    AuditStatus.FAILURE, sinceDate
);
```

## Performance Considerations

1. **Asynchronous Logging**: All audit log operations are asynchronous (`@Async`), so they don't block the main application flow.

2. **Database Indexes**: The migration script includes indexes on commonly queried fields (user_id, event_type, created_at).

3. **Archiving**: Consider implementing a scheduled task to archive old audit logs (e.g., logs older than 1 year) to maintain performance.

## Security and Compliance

1. **PII Protection**: Be careful not to log sensitive personal information (passwords, credit card numbers, etc.)

2. **Data Retention**: Implement a data retention policy for audit logs

3. **Access Control**: Ensure only authorized administrators can access audit logs

4. **GDPR Compliance**: Allow users to request their audit log data and support data deletion requests

## Testing

To test the audit logging system:

1. Register a new user and check that `REGISTRATION_PHASE1_SUCCESS` is logged
2. Complete the profile and check that `REGISTRATION_PHASE2_SUCCESS` is logged
3. Log in successfully and check that `LOGIN_SUCCESS` is logged
4. Try to log in with wrong credentials and check that `LOGIN_FAILURE` is logged
5. Query the audit logs using the repository methods

## Summary

The audit logging system is fully implemented and ready to use. All authentication and registration events are already being logged. When you implement chat, video calls, and matching features, simply inject the `AuditLogService` and use the provided event types to log all important actions.

This comprehensive logging will help with:
- Security monitoring
- User behavior analysis
- Troubleshooting issues
- Compliance and auditing
- Analytics and reporting
