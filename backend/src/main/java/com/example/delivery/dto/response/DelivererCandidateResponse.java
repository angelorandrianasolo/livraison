package com.example.delivery.dto.response;

/** score et distanceKm sont nuls lorsqu'aucune commande n'est fournie pour le calcul. */
public record DelivererCandidateResponse(
        DelivererResponse deliverer,
        Double score,
        Double distanceKm,
        int activeDeliveries) {
}
