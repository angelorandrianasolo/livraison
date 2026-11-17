package com.example.delivery.dto.request;

import com.example.delivery.entity.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(min = 3, max = 60) String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 120) String fullName,
        @NotNull Role role) {
}
