package com.devguardian.service.impl;

import com.devguardian.constants.Messages;
import com.devguardian.dto.AuthResponse;
import com.devguardian.dto.LoginRequest;
import com.devguardian.dto.RegisterRequest;
import com.devguardian.entity.User;
import com.devguardian.entity.enums.ProviderType;
import com.devguardian.entity.enums.Role;
import com.devguardian.repository.UserRepository;
import com.devguardian.security.JwtService;
import com.devguardian.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException(Messages.USER_ALREADY_EXISTS);
        }

        // 2. Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .provider(ProviderType.LOCAL)
                .build();

        // 3. Save user
        user = userRepository.save(user);

        // 4. Generate JWT
        String token = jwtService.generateToken(user);

        // 5. Return response
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .build();
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

        // 4. Return response
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}