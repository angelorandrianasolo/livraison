package com.example.delivery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.Instant;

/** Preuve de livraison. deliveredAt absent : horodatage serveur. */
public record DeliverOrderRequest(
        @NotBlank @Size(max = 120) String receiverName,
        @NotBlank @Size(min = 4, max = 20) String confirmationCode,
        @Size(max = 500) String comment,
        @PastOrPresent Instant deliveredAt) {
}
