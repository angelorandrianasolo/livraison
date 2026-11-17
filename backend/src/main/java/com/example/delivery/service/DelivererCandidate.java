package com.example.delivery.service;

import com.example.delivery.entity.Deliverer;

public record DelivererCandidate(Deliverer deliverer, double score, Double distanceKm, int activeDeliveries) {
}
