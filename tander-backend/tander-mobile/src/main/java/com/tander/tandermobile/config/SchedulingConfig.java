package com.tander.tandermobile.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Configuration to enable Spring's task scheduling.
 * Required for @Scheduled annotations to work (e.g., data retention cleanup).
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
    // Scheduling is now enabled for the application
}
