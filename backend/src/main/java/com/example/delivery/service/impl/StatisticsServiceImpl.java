package com.example.delivery.service.impl;

import com.example.delivery.dto.request.OrderFilter;
import com.example.delivery.dto.request.StatsQuery;
import com.example.delivery.dto.response.DeliveryStatsResponse;
import com.example.delivery.dto.response.DeliveryStatsResponse.DelivererCount;
import com.example.delivery.dto.response.RevenueStatsResponse;
import com.example.delivery.dto.response.RevenueStatsResponse.DailyRevenue;
import com.example.delivery.entity.DeliveryOrder;
import com.example.delivery.entity.enums.OrderStatus;
import com.example.delivery.repository.OrderRepository;
import com.example.delivery.repository.OrderSpecifications;
import com.example.delivery.service.StatisticsService;
import com.example.delivery.util.MathUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Les statistiques portent sur les commandes créées dans la période sélectionnée. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService {

    private final OrderRepository orderRepository;

    @Override
    public DeliveryStatsResponse deliveries(StatsQuery q) {
        List<DeliveryOrder> orders = load(q);
        List<DeliveryOrder> delivered = withStatus(orders, OrderStatus.LIVREE);

        long deliveredCount = delivered.size();
        long failedCount = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.ECHEC_LIVRAISON || o.getStatus() == OrderStatus.RETOURNEE)
                .count();
        long cancelledCount = withStatus(orders, OrderStatus.ANNULEE).size();
        long attempted = deliveredCount + failedCount;
        double successRate = attempted == 0 ? 0 : MathUtils.round1(deliveredCount * 100.0 / attempted);
        double failureRate = attempted == 0 ? 0 : MathUtils.round1(100.0 - successRate);

        double averageMinutes = delivered.stream()
                .mapToLong(o -> Math.max(0, Duration.between(o.getCreatedAt(), o.getProof().getDeliveredAt()).toMinutes()))
                .average().orElse(0);
        double totalDistance = delivered.stream().mapToDouble(DeliveryOrder::getDistanceKm).sum();

        Map<Long, List<DeliveryOrder>> byDeliverer = delivered.stream()
                .filter(o -> o.getDeliverer() != null)
                .collect(Collectors.groupingBy(o -> o.getDeliverer().getId()));
        List<DelivererCount> perDeliverer = byDeliverer.values().stream()
                .map(list -> new DelivererCount(list.get(0).getDeliverer().getId(),
                        list.get(0).getDeliverer().getFullName(), list.size()))
                .sorted(Comparator.comparingLong(DelivererCount::deliveries).reversed())
                .toList();

        return new DeliveryStatsResponse(q.rangeStart(), q.rangeEnd(), orders.size(), deliveredCount, failedCount,
                cancelledCount, successRate, failureRate, MathUtils.round1(averageMinutes),
                MathUtils.round1(totalDistance), perDeliverer);
    }

    @Override
    public RevenueStatsResponse revenue(StatsQuery q) {
        List<DeliveryOrder> delivered = withStatus(load(q), OrderStatus.LIVREE);
        BigDecimal total = delivered.stream().map(DeliveryOrder::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal average = delivered.isEmpty() ? BigDecimal.ZERO
                : total.divide(BigDecimal.valueOf(delivered.size()), 2, RoundingMode.HALF_UP);

        Map<LocalDate, BigDecimal> perDay = delivered.stream().collect(Collectors.groupingBy(
                o -> o.getProof().getDeliveredAt().atZone(ZoneOffset.UTC).toLocalDate(),
                TreeMap::new,
                Collectors.reducing(BigDecimal.ZERO, DeliveryOrder::getPrice, BigDecimal::add)));
        List<DailyRevenue> byDay = perDay.entrySet().stream()
                .map(e -> new DailyRevenue(e.getKey(), e.getValue())).toList();

        return new RevenueStatsResponse(q.rangeStart(), q.rangeEnd(), delivered.size(), total, average, byDay);
    }

    private List<DeliveryOrder> load(StatsQuery q) {
        OrderFilter filter = new OrderFilter(null, null, q.zoneId(), q.delivererId(), null, null,
                q.rangeStart(), q.rangeEnd());
        return orderRepository.findAll(OrderSpecifications.withFilter(filter));
    }

    private static List<DeliveryOrder> withStatus(List<DeliveryOrder> orders, OrderStatus status) {
        return orders.stream().filter(o -> o.getStatus() == status).toList();
    }
}
