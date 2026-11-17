package com.example.delivery.dto.response;

import com.example.delivery.entity.enums.Role;
import java.time.Instant;

public record AuthResponse(String token, Instant expiresAt, String username, String fullName, Role role) {
}
