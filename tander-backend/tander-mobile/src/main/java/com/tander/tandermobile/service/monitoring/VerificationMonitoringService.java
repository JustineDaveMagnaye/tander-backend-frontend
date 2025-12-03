package com.tander.tandermobile.service.monitoring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Monitoring service for ID verification system.
 * Tracks success/failure rates, alerts on anomalies.
 * 100% FREE - uses logging and in-memory metrics.
 */
@Service
public class VerificationMonitoringService {

    private static final Logger LOGGER = LoggerFactory.getLogger(VerificationMonitoringService.class);
    private static final Logger ALERT_LOGGER = LoggerFactory.getLogger("VERIFICATION_ALERTS");

    // Metrics storage
    private final AtomicInteger totalAttempts = new AtomicInteger(0);
    private final AtomicInteger successfulVerifications = new AtomicInteger(0);
    private final AtomicInteger failedVerifications = new AtomicInteger(0);
    private final AtomicInteger rejectedAge = new AtomicInteger(0);
    private final AtomicInteger ocrFailures = new AtomicInteger(0);
    private final AtomicInteger blurryPhotos = new AtomicInteger(0);
    private final AtomicInteger rateLimitExceeded = new AtomicInteger(0);
    private final AtomicInteger recaptchaFailed = new AtomicInteger(0);

    // Failure tracking by reason
    private final ConcurrentHashMap<String, AtomicInteger> failureReasons = new ConcurrentHashMap<>();

    // Alert thresholds
    private static final int HIGH_FAILURE_RATE_THRESHOLD = 70; // %
    private static final int CONSECUTIVE_FAILURES_ALERT = 10;
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);

    /**
     * Records a successful verification.
     */
    public void recordSuccess(String username, int age) {
        totalAttempts.incrementAndGet();
        successfulVerifications.incrementAndGet();
        consecutiveFailures.set(0);

        LOGGER.info("✅ [METRICS] Verification SUCCESS: user={}, age={}, total={}, success_rate={}%",
                username, age, totalAttempts.get(), getSuccessRate());
    }

    /**
     * Records a failed verification with reason.
     */
    public void recordFailure(String username, String reason, String details) {
        totalAttempts.incrementAndGet();
        failedVerifications.incrementAndGet();
        int consecutive = consecutiveFailures.incrementAndGet();

        // Categorize failure
        if (reason.contains("age") || reason.contains("requirement")) {
            rejectedAge.incrementAndGet();
        } else if (reason.contains("blur")) {
            blurryPhotos.incrementAndGet();
        } else if (reason.contains("OCR") || reason.contains("birthdate")) {
            ocrFailures.incrementAndGet();
        } else if (reason.contains("rate limit")) {
            rateLimitExceeded.incrementAndGet();
        } else if (reason.contains("reCAPTCHA") || reason.contains("bot")) {
            recaptchaFailed.incrementAndGet();
        }

        // Track specific reasons
        failureReasons.computeIfAbsent(reason, k -> new AtomicInteger()).incrementAndGet();

        LOGGER.warn("❌ [METRICS] Verification FAILED: user={}, reason='{}', consecutive_failures={}, failure_rate={}%",
                username, reason, consecutive, getFailureRate());

        // Alert on anomalies
        checkAndAlert();
    }

    /**
     * Records rate limit exceeded.
     */
    public void recordRateLimitExceeded(String ipAddress) {
        rateLimitExceeded.incrementAndGet();
        ALERT_LOGGER.warn("🚫 [ALERT] Rate limit exceeded from IP: {} (total: {})",
                ipAddress, rateLimitExceeded.get());
    }

    /**
     * Records reCAPTCHA failure.
     */
    public void recordRecaptchaFailure(String ipAddress, double score) {
        recaptchaFailed.incrementAndGet();
        ALERT_LOGGER.warn("🤖 [ALERT] reCAPTCHA failed from IP: {}, score: {} (total: {})",
                ipAddress, score, recaptchaFailed.get());
    }

    /**
     * Gets current success rate as percentage.
     */
    public int getSuccessRate() {
        int total = totalAttempts.get();
        if (total == 0) return 0;
        return (successfulVerifications.get() * 100) / total;
    }

    /**
     * Gets current failure rate as percentage.
     */
    public int getFailureRate() {
        int total = totalAttempts.get();
        if (total == 0) return 0;
        return (failedVerifications.get() * 100) / total;
    }

    /**
     * Gets comprehensive metrics summary.
     */
    public String getMetricsSummary() {
        StringBuilder summary = new StringBuilder();
        summary.append("\n╔══════════════════════════════════════════════════════════╗\n");
        summary.append("║  ID VERIFICATION METRICS SUMMARY                         ║\n");
        summary.append("╠══════════════════════════════════════════════════════════╣\n");
        summary.append(String.format("║  Total Attempts:        %-32d ║\n", totalAttempts.get()));
        summary.append(String.format("║  ✅ Successful:         %-32d ║\n", successfulVerifications.get()));
        summary.append(String.format("║  ❌ Failed:             %-32d ║\n", failedVerifications.get()));
        summary.append(String.format("║  Success Rate:          %-31s%% ║\n", getSuccessRate()));
        summary.append("╠══════════════════════════════════════════════════════════╣\n");
        summary.append("║  FAILURE BREAKDOWN                                       ║\n");
        summary.append("╠══════════════════════════════════════════════════════════╣\n");
        summary.append(String.format("║  Age Rejected:          %-32d ║\n", rejectedAge.get()));
        summary.append(String.format("║  OCR Failures:          %-32d ║\n", ocrFailures.get()));
        summary.append(String.format("║  Blurry Photos:         %-32d ║\n", blurryPhotos.get()));
        summary.append(String.format("║  Rate Limited:          %-32d ║\n", rateLimitExceeded.get()));
        summary.append(String.format("║  reCAPTCHA Failed:      %-32d ║\n", recaptchaFailed.get()));
        summary.append("╚══════════════════════════════════════════════════════════╝\n");

        return summary.toString();
    }

    /**
     * Checks for anomalies and sends alerts.
     */
    private void checkAndAlert() {
        // Alert on high failure rate
        int failureRate = getFailureRate();
        int total = totalAttempts.get();

        if (total >= 20 && failureRate >= HIGH_FAILURE_RATE_THRESHOLD) {
            ALERT_LOGGER.error("🚨 [CRITICAL ALERT] High failure rate detected: {}% (threshold: {}%)",
                    failureRate, HIGH_FAILURE_RATE_THRESHOLD);
            ALERT_LOGGER.error(getMetricsSummary());
        }

        // Alert on consecutive failures
        int consecutive = consecutiveFailures.get();
        if (consecutive >= CONSECUTIVE_FAILURES_ALERT) {
            ALERT_LOGGER.error("🚨 [CRITICAL ALERT] {} consecutive verification failures detected!",
                    consecutive);
        }
    }

    /**
     * Logs metrics summary (call this periodically or on-demand).
     */
    public void logMetricsSummary() {
        LOGGER.info(getMetricsSummary());
    }

    /**
     * Resets all metrics (useful for testing or periodic resets).
     */
    public void resetMetrics() {
        totalAttempts.set(0);
        successfulVerifications.set(0);
        failedVerifications.set(0);
        rejectedAge.set(0);
        ocrFailures.set(0);
        blurryPhotos.set(0);
        rateLimitExceeded.set(0);
        recaptchaFailed.set(0);
        consecutiveFailures.set(0);
        failureReasons.clear();
        LOGGER.info("🔄 All metrics reset");
    }
}
