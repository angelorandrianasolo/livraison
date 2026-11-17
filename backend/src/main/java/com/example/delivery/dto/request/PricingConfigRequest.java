package com.example.delivery.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PricingConfigRequest(
        @NotNull @DecimalMin("0.00") BigDecimal baseFee,
        @NotNull @DecimalMin("0.00") BigDecimal pricePerKm,
        @NotNull @DecimalMin("0.00") BigDecimal pricePerKg,
        @NotNull @DecimalMin("0.00") BigDecimal pricePerM3,
        @NotNull @DecimalMin("1.00") @DecimalMax("10.00") BigDecimal urgentMultiplier,
        @NotNull @DecimalMin("1.00") @DecimalMax("10.00") BigDecimal expressMultiplier) {
}
