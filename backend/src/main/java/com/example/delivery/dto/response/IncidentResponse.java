package com.example.delivery.dto.response;

import com.example.delivery.entity.enums.IncidentType;
import java.time.Instant;

public record IncidentResponse(
        Long id,
        IncidentType type,
        String description,
        Instant occurredAt,
        Long orderId,
        String orderNumber,
        Long delivererId,
        String delivererName,
        String resolution,
        boolean resolved,
        Instant resolvedAt) {
}
