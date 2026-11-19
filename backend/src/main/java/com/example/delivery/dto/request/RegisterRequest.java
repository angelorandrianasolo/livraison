package com.example.delivery.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Inscription publique : le rôle n'est jamais choisi par le client (toujours USER). */
public record RegisterRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(min = 3, max = 60)
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Caractères autorisés : lettres, chiffres, . _ -") String username,
        @NotBlank @Size(min = 8, max = 100) String password) {
}