package com.example.delivery.mapper;

import com.example.delivery.dto.response.UserResponse;
import com.example.delivery.entity.AppUser;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(AppUser u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getFullName(), u.getRole(), u.isEnabled());
    }
}
