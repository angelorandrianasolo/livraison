package com.example.delivery.dto.response;

import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.entity.enums.Priority;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        Set<OrderStatus> allowedTransitions,
        Priority priority,
        CustomerSummary customer,
        String pickupAddress,
        String deliveryAddress,
        Double pickupLatitude,
        Double pickupLongitude,
        double weightKg,
        double volumeM3,
        double distanceKm,
        ZoneResponse zone,
        BigDecimal price,
        LocalDate plannedDate,
        DelivererSummary deliverer,
        ProofResponse proof,
        Instant createdAt,
        Instant updatedAt) {

    public record CustomerSummary(Long id, String name) {
    }

    public record DelivererSummary(Long id, String fullName, String phone) {
    }

    public record ProofResponse(Instant deliveredAt, String receiverName, String confirmationCode, String comment) {
    }
}
