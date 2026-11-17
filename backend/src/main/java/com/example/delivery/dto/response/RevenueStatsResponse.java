package com.example.delivery.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueStatsResponse(
        LocalDate from,
        LocalDate to,
        long deliveredCount,
        BigDecimal totalRevenue,
        BigDecimal averageRevenue,
        List<DailyRevenue> revenueByDay) {

    public record DailyRevenue(LocalDate date, BigDecimal amount) {
    }
}
