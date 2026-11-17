package com.example.delivery.service;

import com.example.delivery.dto.request.LoginRequest;
import com.example.delivery.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
