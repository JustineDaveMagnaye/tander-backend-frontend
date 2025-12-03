package com.tander.tandermobile.listener.authentication;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditStatus;
import com.tander.tandermobile.service.audit.AuditLogService;
import com.tander.tandermobile.service.login.attempt.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Listener component that handles authentication failure events caused by bad credentials.
 * This track failed login attempts and potentially prevent brute-force attacks by limiting
 * the number of failed attempts.
 */
@Component
public class AuthenticationFailureListener {

    private final LoginAttemptService loginAttemptService;
    private final AuditLogService auditLogService;

    /**
     *This is to track failed login attempts and take action based on the number of unsuccessful attempts.
     *
     * @param loginAttemptService service responsible for handling login attempts
     * @param auditLogService service responsible for audit logging
     */
    @Autowired
    public AuthenticationFailureListener(LoginAttemptService loginAttemptService, AuditLogService auditLogService) {
        this.loginAttemptService = loginAttemptService;
        this.auditLogService = auditLogService;
    }

    /**
     * Listens for authentication failures caused by bad credentials and adds the user's
     *
     * @param event event triggered on authentication failure
     */
    @EventListener
    public void onAuthenticationFailure(AuthenticationFailureBadCredentialsEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if(principal instanceof String) {
            String username = (String) event.getAuthentication().getPrincipal();
            loginAttemptService.addUserToLoginAttemptCache(username);

            // Log failed login attempt
            String ipAddress = getClientIpAddress();
            String userAgent = getUserAgent();
            auditLogService.logEvent(
                    AuditEventType.LOGIN_FAILURE,
                    AuditStatus.FAILURE,
                    null,
                    username,
                    "Failed login attempt - Bad credentials",
                    ipAddress,
                    userAgent,
                    "Bad credentials"
            );
        }
    }

    private String getClientIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                return xForwardedFor.split(",")[0];
            }
            return request.getRemoteAddr();
        }
        return "unknown";
    }

    private String getUserAgent() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            return attributes.getRequest().getHeader("User-Agent");
        }
        return "unknown";
    }
}
