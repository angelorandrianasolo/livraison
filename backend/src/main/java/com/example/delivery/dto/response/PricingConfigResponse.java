package com.example.delivery.dto.response;

import java.math.BigDecimal;

public record PricingConfigResponse(
        BigDecimal baseFee,
        BigDecimal pricePerKm,
        BigDecimal pricePerKg,
        BigDecimal pricePerM3,
        BigDecimal urgentMultiplier,
        BigDecimal expressMultiplier) {
}
