package com.tander.tandermobile.service.recaptcha;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Service for verifying Google reCAPTCHA v3 tokens.
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

    public boolean verifyToken(String token, String action) {
        if (!enabled) {
            LOGGER.warn("⚠️ reCAPTCHA is DISABLED - skipping verification");
            return true;
        }

        boolean isTestKey = secretKey != null && secretKey.equals("6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe");

        if (token == null || token.isEmpty()) {
            if (isTestKey) {
                LOGGER.warn("⚠️ reCAPTCHA token is null - allowing because test key is active (dev mode)");
                return true;
            }
            LOGGER.error("❌ reCAPTCHA token is null or empty");
            return false;
        }

        try {
            String requestUrl = String.format("%s?secret=%s&response=%s",
                    verificationUrl, secretKey, token);

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

            // DEV MODE: Allow test keys to bypass action/score checks
            if (isTestKey) {
                LOGGER.warn("⚠️ Test key active - bypassing action and score checks");
                return true;
            }

            // Verify action
            if (!responseAction.equals(action)) {
                LOGGER.warn("⚠️ reCAPTCHA action mismatch: expected='{}', got='{}'", action, responseAction);
                return false;
            }

            // Verify score
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
            // Fail open in case of API errors for better UX
            return isTestKey || true;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }
}
