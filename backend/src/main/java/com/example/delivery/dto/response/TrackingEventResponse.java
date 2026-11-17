package com.example.delivery.dto.response;

import com.example.delivery.entity.enums.OrderStatus;
import java.time.Instant;

public record TrackingEventResponse(Long id, OrderStatus status, String note, String actor, Instant occurredAt) {
}
