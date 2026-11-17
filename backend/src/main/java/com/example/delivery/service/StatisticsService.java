package com.example.delivery.service;

import com.example.delivery.dto.request.StatsQuery;
import com.example.delivery.dto.response.DeliveryStatsResponse;
import com.example.delivery.dto.response.RevenueStatsResponse;

public interface StatisticsService {
    DeliveryStatsResponse deliveries(StatsQuery query);

    RevenueStatsResponse revenue(StatsQuery query);
}
