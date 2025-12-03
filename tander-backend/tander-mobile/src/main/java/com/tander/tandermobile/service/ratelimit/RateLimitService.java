package com.tander.tandermobile.service.ratelimit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Instant;

/**
 * Service for rate limiting to prevent abuse of public endpoints.
 * Tracks requests per IP address and enforces configurable limits.
 */
@Service
public class RateLimitService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitService.class);

    // Rate limiting: 10 requests per minute per IP for ID verification
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final long WINDOW_SIZE_MILLIS = 60_000; // 1 minute

    // Store request counts per IP: IP -> RequestInfo
    private final ConcurrentHashMap<String, RequestInfo> requestCounts = new ConcurrentHashMap<>();

    /**
     * Checks if a request from the given IP should be allowed.
     * Returns true if within rate limit, false if exceeded.
     */
    public boolean allowRequest(String ipAddress, String endpoint) {
        if (ipAddress == null || ipAddress.isEmpty()) {
            LOGGER.warn("⚠️ Rate limit check for null/empty IP address");
            return true; // Allow if IP cannot be determined
        }

        String key = ipAddress + ":" + endpoint;
        long now = Instant.now().toEpochMilli();

        RequestInfo info = requestCounts.compute(key, (k, existing) -> {
            if (existing == null || (now - existing.windowStart) > WINDOW_SIZE_MILLIS) {
                // New window or expired window - reset
                return new RequestInfo(now, 1);
            } else {
                // Within current window - increment
                existing.count.incrementAndGet();
                return existing;
            }
        });

        boolean allowed = info.count.get() <= MAX_REQUESTS_PER_MINUTE;

        if (!allowed) {
            LOGGER.warn("🚫 Rate limit exceeded for IP: {} on endpoint: {} (count: {})",
                    ipAddress, endpoint, info.count.get());
        } else {
            LOGGER.debug("✅ Rate limit check passed for IP: {} on endpoint: {} (count: {}/{})",
                    ipAddress, endpoint, info.count.get(), MAX_REQUESTS_PER_MINUTE);
        }

        // Cleanup old entries (simple approach - only clean on access)
        cleanupExpiredEntries(now);

        return allowed;
    }

    /**
     * Cleans up expired entries to prevent memory leak.
     * Only cleans periodically to avoid overhead.
     */
    private void cleanupExpiredEntries(long now) {
        // Only cleanup if map is getting large (simple heuristic)
        if (requestCounts.size() > 1000) {
            requestCounts.entrySet().removeIf(entry ->
                    (now - entry.getValue().windowStart) > (WINDOW_SIZE_MILLIS * 2)
            );
        }
    }

    /**
     * Stores request count information for a time window.
     */
    private static class RequestInfo {
        final long windowStart;
        final AtomicInteger count;

        RequestInfo(long windowStart, int initialCount) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(initialCount);
        }
    }
}
