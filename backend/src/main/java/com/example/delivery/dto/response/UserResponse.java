package com.example.delivery.dto.response;

import com.example.delivery.entity.enums.Role;

public record UserResponse(Long id, String username, String fullName, Role role, boolean enabled) {
}
