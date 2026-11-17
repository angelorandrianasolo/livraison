package com.example.delivery.dto.request;

/** delivererId absent : attribution automatique au meilleur score. */
public record AssignOrderRequest(Long delivererId) {
}
