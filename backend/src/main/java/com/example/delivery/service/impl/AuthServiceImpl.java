package com.example.delivery.service.impl;

import com.example.delivery.dto.request.LoginRequest;
import com.example.delivery.dto.request.RegisterRequest;
import com.example.delivery.dto.response.AuthResponse;
import com.example.delivery.entity.AppUser;
import com.example.delivery.entity.enums.Role;
import com.example.delivery.exception.ConflictException;
import com.example.delivery.repository.UserRepository;
import com.example.delivery.security.JwtService;
import com.example.delivery.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        AppUser user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new BadCredentialsException("Identifiants invalides"));
        return toResponse(user);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        if (userRepository.existsByUsername(username)) {
            throw new ConflictException("Le nom d'utilisateur '%s' est déjà utilisé".formatted(username));
        }
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setFullName(request.fullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        return toResponse(userRepository.save(user));
    }

    private AuthResponse toResponse(AppUser user) {
        JwtService.IssuedToken token = jwtService.generate(user);
        return new AuthResponse(token.value(), token.expiresAt(), user.getUsername(), user.getFullName(), user.getRole());
    }
}