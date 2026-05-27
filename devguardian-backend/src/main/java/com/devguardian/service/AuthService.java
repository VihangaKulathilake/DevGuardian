package com.devguardian.service;

import com.devguardian.dto.auth.AuthResponse;
import com.devguardian.dto.auth.LoginRequest;
import com.devguardian.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
