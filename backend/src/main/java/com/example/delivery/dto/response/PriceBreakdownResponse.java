package com.example.delivery.dto.response;

import java.math.BigDecimal;

public record PriceBreakdownResponse(
        BigDecimal baseFee,
        BigDecimal distanceCost,
        BigDecimal weightCost,
        BigDecimal volumeCost,
        BigDecimal subtotal,
        BigDecimal priorityMultiplier,
        BigDecimal zoneSurchargeRate,
        BigDecimal total) {
}
