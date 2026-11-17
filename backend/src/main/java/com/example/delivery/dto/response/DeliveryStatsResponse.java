package com.example.delivery.dto.response;

import java.time.LocalDate;
import java.util.List;

public record DeliveryStatsResponse(
        LocalDate from,
        LocalDate to,
        long totalOrders,
        long deliveredCount,
        long failedCount,
        long cancelledCount,
        double successRate,
        double failureRate,
        double averageDeliveryMinutes,
        double totalDistanceKm,
        List<DelivererCount> deliveriesPerDeliverer) {

    public record DelivererCount(Long delivererId, String delivererName, long deliveries) {
    }
}
