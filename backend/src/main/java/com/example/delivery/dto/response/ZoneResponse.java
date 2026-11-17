package com.example.delivery.dto.response;

import java.math.BigDecimal;

public record ZoneResponse(Long id, String code, String name, BigDecimal surchargeRate) {
}
