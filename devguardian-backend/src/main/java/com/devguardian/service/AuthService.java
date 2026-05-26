package com.devguardian.service;

import com.devguardian.dto.AuthResponse;
import com.devguardian.dto.LoginRequest;
import com.devguardian.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
