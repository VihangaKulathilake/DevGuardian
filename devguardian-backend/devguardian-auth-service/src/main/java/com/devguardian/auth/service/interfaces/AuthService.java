package com.devguardian.auth.service.interfaces;

import com.devguardian.auth.dto.AuthResponse;
import com.devguardian.auth.dto.LoginRequest;
import com.devguardian.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}

