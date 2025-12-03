package com.tander.tandermobile.service.recaptcha;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for verifying Google reCAPTCHA v3 tokens.
 * Uses invisible reCAPTCHA optimized for senior citizens (no user interaction required).
 * FREE tier: 1 million assessments/month.
 */
@Service
public class RecaptchaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecaptchaService.class);

    @Value("${recaptcha.secret-key}")
    private String secretKey;

    @Value("${recaptcha.verification-url}")
    private String verificationUrl;

    @Value("${recaptcha.score-threshold}")
    private double scoreThreshold;

    @Value("${recaptcha.enabled}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Verifies reCAPTCHA token from frontend.
     * Returns true if verification passes and score is above threshold.
     *
     * @param token reCAPTCHA token from frontend
     * @param action expected action name (e.g., "verify_id")
     * @return true if human, false if bot or verification failed
     */
    public boolean verifyToken(String token, String action) {
        if (!enabled) {
            LOGGER.warn("⚠️ reCAPTCHA is DISABLED - skipping verification");
            return true;
        }

        if (token == null || token.isEmpty()) {
            LOGGER.error("❌ reCAPTCHA token is null or empty");
            return false;
        }

        try {
            // Build request parameters
            String requestUrl = String.format("%s?secret=%s&response=%s",
                    verificationUrl, secretKey, token);

            // Call Google reCAPTCHA API
            ResponseEntity<Map> response = restTemplate.postForEntity(requestUrl, null, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null) {
                LOGGER.error("❌ reCAPTCHA API returned null response");
                return false;
            }

            boolean success = (boolean) responseBody.getOrDefault("success", false);
            double score = ((Number) responseBody.getOrDefault("score", 0.0)).doubleValue();
            String responseAction = (String) responseBody.getOrDefault("action", "");

            LOGGER.info("🔍 reCAPTCHA result: success={}, score={}, action={}, threshold={}",
                    success, score, responseAction, scoreThreshold);

            // Verify action matches (prevents token reuse)
            if (!responseAction.equals(action)) {
                LOGGER.warn("⚠️ reCAPTCHA action mismatch: expected='{}', got='{}'", action, responseAction);
                return false;
            }

            // Check if score meets threshold
            if (success && score >= scoreThreshold) {
                LOGGER.info("✅ reCAPTCHA verification passed (score: {})", score);
                return true;
            } else {
                LOGGER.warn("🚫 reCAPTCHA verification failed: success={}, score={} (threshold: {})",
                        success, score, scoreThreshold);
                return false;
            }

        } catch (Exception e) {
            LOGGER.error("❌ reCAPTCHA verification error: {}", e.getMessage(), e);
            // Fail open in case of API errors (better UX for seniors)
            // In production, you might want to fail closed for security
            return true;
        }
    }

    /**
     * Checks if reCAPTCHA is enabled in configuration.
     */
    public boolean isEnabled() {
        return enabled;
    }
}
