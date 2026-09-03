package com.devguardian.auth.service.impl;

import com.devguardian.constants.Messages;
import com.devguardian.auth.dto.*;
import com.devguardian.auth.entity.User;
import com.devguardian.auth.enums.ProviderType;
import com.devguardian.auth.enums.Role;
import com.devguardian.auth.repository.UserRepository;
import com.devguardian.security.JwtService;
import com.devguardian.auth.service.interfaces.AsgardeoOAuthService;
import com.devguardian.auth.service.interfaces.AuthService;
import com.devguardian.auth.service.interfaces.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.devguardian.auth.mapper.AuthMapper;
import com.devguardian.common.exception.custom.BusinessException;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;
    private final GoogleOAuthService googleOAuthService;
    private final AsgardeoOAuthService asgardeoOAuthService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException(Messages.USER_ALREADY_EXISTS);
        }

        // 2. Create new user
        User user = authMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setProvider(ProviderType.LOCAL);

        // 3. Save user
        user = userRepository.save(user);

        // 4. Generate JWT
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse response = authMapper.toResponse(user);
        response.setToken(token);

        // 5. Return response
        return response;
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // 1. Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(Messages.INVALID_CREDENTIALS));

        // 2. Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException(Messages.INVALID_CREDENTIALS);
        }

        // 3. Generate JWT
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse response = authMapper.toResponse(user);
        response.setToken(token);

        // 4. Return response
        return response;
    }

    @Override
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        log.info("Processing Google OAuth login request");

        GoogleUserInfo googleUser = googleOAuthService.verifyToken(request.getIdToken());
        if (googleUser == null || googleUser.getEmail() == null || googleUser.getEmail().isBlank()) {
            throw new BadCredentialsException("Failed to verify Google identity");
        }

        String email = googleUser.getEmail().toLowerCase().trim();
        String name = googleUser.getName();
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        }

        // 1. Find existing user or create a new user account
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.info("Creating new Google user account for: {}", email);
            user = User.builder()
                    .email(email)
                    .name(name)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .provider(ProviderType.GOOGLE)
                    .build();
            user = userRepository.save(user);
        } else {
            log.info("Existing user logged in via Google: {}", email);
            if (user.getProvider() == null) {
                user.setProvider(ProviderType.GOOGLE);
                user = userRepository.save(user);
            }
        }

        // 2. Generate application JWT
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse response = authMapper.toResponse(user);
        response.setToken(token);

        return response;
    }

    @Override
    public AuthResponse loginWithAsgardeo(AsgardeoAuthRequest request) {
        log.info("Processing Asgardeo OIDC login request");

        AsgardeoUserInfo asgardeoUser = asgardeoOAuthService.getUserInfo(request);
        if (asgardeoUser == null || (asgardeoUser.getEmail() == null && asgardeoUser.getUsername() == null)) {
            throw new BadCredentialsException("Failed to verify Asgardeo identity");
        }

        String email = asgardeoUser.getEmail();
        if (email == null || email.isBlank()) {
            email = asgardeoUser.getUsername();
        }
        email = email.toLowerCase().trim();

        String name = asgardeoUser.getName();
        if (name == null || name.isBlank()) {
            if (asgardeoUser.getGivenName() != null) {
                name = asgardeoUser.getGivenName() + (asgardeoUser.getFamilyName() != null ? " " + asgardeoUser.getFamilyName() : "");
            } else {
                name = email.split("@")[0];
            }
        }

        // 1. Find existing user or create a new user account
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            log.info("Creating new Asgardeo user account for: {}", email);
            user = User.builder()
                    .email(email)
                    .name(name)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.USER)
                    .provider(ProviderType.ASGARDEO)
                    .build();
            user = userRepository.save(user);
        } else {
            log.info("Existing user logged in via Asgardeo: {}", email);
            if (user.getProvider() == null) {
                user.setProvider(ProviderType.ASGARDEO);
                user = userRepository.save(user);
            }
        }

        // 2. Generate application JWT
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        AuthResponse response = authMapper.toResponse(user);
        response.setToken(token);

        return response;
    }
}
