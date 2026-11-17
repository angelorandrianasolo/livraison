package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateIncidentRequest(
        @NotNull IncidentType type,
        @NotBlank @Size(max = 1000) String description) {
}
