package com.devguardian.auth.service;

import com.devguardian.auth.dto.AuthResponse;
import com.devguardian.auth.dto.LoginRequest;
import com.devguardian.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}

