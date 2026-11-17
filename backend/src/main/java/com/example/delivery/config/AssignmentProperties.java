package com.example.delivery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Coefficients configurables du score d'attribution automatique des livreurs.
 */
@ConfigurationProperties(prefix = "app.assignment")
public record AssignmentProperties(
        double proximityWeight,
        double loadWeight,
        double capacityWeight,
        double urgentProximityBoost,
        double maxProximityKm) {
}
