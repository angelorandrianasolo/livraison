package com.example.delivery.dto.request;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.springframework.format.annotation.DateTimeFormat;

/** Filtres des statistiques : période autour d'une date, livreur, zone. */
public record StatsQuery(
        StatsPeriod period,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        Long delivererId,
        Long zoneId) {

    public StatsQuery {
        period = period == null ? StatsPeriod.DAY : period;
        date = date == null ? LocalDate.now(ZoneOffset.UTC) : date;
    }

    public LocalDate rangeStart() {
        return switch (period) {
            case DAY -> date;
            case WEEK -> date.with(DayOfWeek.MONDAY);
            case MONTH -> date.withDayOfMonth(1);
        };
    }

    public LocalDate rangeEnd() {
        return switch (period) {
            case DAY -> date;
            case WEEK -> date.with(DayOfWeek.MONDAY).plusDays(6);
            case MONTH -> date.withDayOfMonth(date.lengthOfMonth());
        };
    }
}
