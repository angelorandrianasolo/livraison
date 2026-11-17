package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.DelivererStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateDelivererStatusRequest(@NotNull DelivererStatus status) {
}
