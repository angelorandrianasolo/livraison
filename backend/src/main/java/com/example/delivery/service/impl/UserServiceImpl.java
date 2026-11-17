package com.example.delivery.service.impl;

import com.example.delivery.dto.request.CreateUserRequest;
import com.example.delivery.dto.response.UserResponse;
import com.example.delivery.entity.AppUser;
import com.example.delivery.exception.ConflictException;
import com.example.delivery.mapper.UserMapper;
import com.example.delivery.repository.UserRepository;
import com.example.delivery.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper mapper;

    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Le nom d'utilisateur '%s' est déjà utilisé".formatted(request.username()));
        }
        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(request.role());
        return mapper.toResponse(userRepository.save(user));
    }
}
