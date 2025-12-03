package com.tander.tandermobile.listener.authentication;

import com.tander.tandermobile.domain.audit.AuditEventType;
import com.tander.tandermobile.domain.audit.AuditStatus;
import com.tander.tandermobile.domain.user.User;
import com.tander.tandermobile.service.audit.AuditLogService;
import com.tander.tandermobile.service.login.attempt.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 *  This handles authentication success events.
 *  This is to clear user's login attempt cache upon successful authentication
 */
@Component
public class AuthenticationSuccessListener {

    private final LoginAttemptService loginAttemptService;
    private final AuditLogService auditLogService;

    /**
     * Constructs an AuthenticationSuccessListener with the provided LoginAttemptService
     * Managing login attempt tracking and perform actions upon successful authentication.
     *
     * @param loginAttemptService service responsible for managing login attempts
     * @param auditLogService service responsible for audit logging
     */
    @Autowired
    public AuthenticationSuccessListener(LoginAttemptService loginAttemptService, AuditLogService auditLogService) {
        this.loginAttemptService = loginAttemptService;
        this.auditLogService = auditLogService;
    }

    /**
     * Listens for successful authentication events and evicts the user from the login attempt cache.
     *
     * @param event event triggered on successful authentication
     */
    @EventListener
    public void onAuthenticationSuccess(AuthenticationSuccessEvent event) {
        Object principal = event.getAuthentication().getPrincipal();
        if(principal instanceof User) {
            User user = (User) event.getAuthentication().getPrincipal();
            loginAttemptService.evictUserFromLoginAttemptCache(user.getUsername());

            // Log successful login
            String ipAddress = getClientIpAddress();
            String userAgent = getUserAgent();
            auditLogService.logEvent(
                    AuditEventType.LOGIN_SUCCESS,
                    AuditStatus.SUCCESS,
                    user.getId(),
                    user.getUsername(),
                    "User logged in successfully",
                    ipAddress,
                    userAgent
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
