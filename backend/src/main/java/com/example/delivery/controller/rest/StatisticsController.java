package com.example.delivery.controller.rest;

import com.example.delivery.dto.request.StatsQuery;
import com.example.delivery.dto.response.DeliveryStatsResponse;
import com.example.delivery.dto.response.RevenueStatsResponse;
import com.example.delivery.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Filtres : period=DAY|WEEK|MONTH, date=yyyy-MM-dd, delivererId, zoneId. */
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/deliveries")
    public DeliveryStatsResponse deliveries(StatsQuery query) {
        return statisticsService.deliveries(query);
    }

    @GetMapping("/revenue")
    public RevenueStatsResponse revenue(StatsQuery query) {
        return statisticsService.revenue(query);
    }
}
