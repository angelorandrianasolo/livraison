package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.VehicleType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record DelivererRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Size(max = 30) String phone,
        @NotNull VehicleType vehicleType,
        @NotNull Long zoneId,
        @Positive double maxCapacityKg,
        @Positive double maxVolumeM3,
        @Min(1) @Max(20) int maxActiveDeliveries,
        @DecimalMin("-90") @DecimalMax("90") Double lastLatitude,
        @DecimalMin("-180") @DecimalMax("180") Double lastLongitude) {
}
