package com.devguardian.auth.mapper;

import com.devguardian.auth.dto.AuthResponse;
import com.devguardian.auth.dto.RegisterRequest;
import com.devguardian.auth.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
    }

    public AuthResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return AuthResponse.builder()
                .userId(user.getId())
                .role(user.getRole())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}
