package com.devguardian.service.impl;

import com.devguardian.constants.Messages;
import com.devguardian.dto.auth.AuthResponse;
import com.devguardian.dto.auth.LoginRequest;
import com.devguardian.dto.auth.RegisterRequest;
import com.devguardian.entity.User;
import com.devguardian.entity.enums.ProviderType;
import com.devguardian.entity.enums.Role;
import com.devguardian.repository.UserRepository;
import com.devguardian.security.JwtService;
import com.devguardian.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.devguardian.mapper.AuthMapper;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException(Messages.USER_ALREADY_EXISTS);
        }

        // 2. Create new user
        User user = authMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setProvider(ProviderType.LOCAL);

        // 3. Save user
        user = userRepository.save(user);

        // 4. Generate JWT
        String token = jwtService.generateToken(user);

        AuthResponse response = authMapper.toResponse(user);
        response.setToken(token);

        // 5. Return response
        return response;
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // 1. Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException(Messages.INVALID_CREDENTIALS));

        // 2. Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException(Messages.INVALID_CREDENTIALS);
        }

        // 3. Generate JWT
        String token = jwtService.generateToken(user);

        AuthResponse response = authMapper.toResponse(user);
        response.setToken(token);

        // 4. Return response
        return response;
    }
}