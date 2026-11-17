package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.Priority;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record PriceEstimateRequest(
        @NotNull Long zoneId,
        @PositiveOrZero double distanceKm,
        @PositiveOrZero double weightKg,
        @PositiveOrZero double volumeM3,
        @NotNull Priority priority) {
}
