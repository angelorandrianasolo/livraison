package com.example.delivery.service;

import com.example.delivery.dto.request.CreateUserRequest;
import com.example.delivery.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    List<UserResponse> findAll();

    UserResponse create(CreateUserRequest request);
}
