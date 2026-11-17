package com.example.delivery.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ZoneRequest(
        @NotBlank @Size(max = 20) String code,
        @NotBlank @Size(max = 80) String name,
        @NotNull @DecimalMin("0.00") @DecimalMax("5.00") BigDecimal surchargeRate) {
}
