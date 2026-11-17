package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.Priority;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateOrderRequest(
        @NotBlank @Size(max = 255) String pickupAddress,
        @NotBlank @Size(max = 255) String deliveryAddress,
        @DecimalMin("-90") @DecimalMax("90") Double pickupLatitude,
        @DecimalMin("-180") @DecimalMax("180") Double pickupLongitude,
        @Positive double weightKg,
        @Positive double volumeM3,
        @NotNull Priority priority,
        @Positive double distanceKm,
        @NotNull Long zoneId,
        @NotNull @FutureOrPresent LocalDate plannedDate) {
}
