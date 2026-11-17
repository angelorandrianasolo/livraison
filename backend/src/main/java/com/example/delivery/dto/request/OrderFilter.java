package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.entity.enums.Priority;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

/** Critères de recherche des commandes (paramètres de requête). */
public record OrderFilter(
        OrderStatus status,
        Priority priority,
        Long zoneId,
        Long delivererId,
        Long customerId,
        String q,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
}
