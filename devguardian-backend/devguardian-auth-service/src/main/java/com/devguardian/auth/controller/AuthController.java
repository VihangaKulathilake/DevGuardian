package com.devguardian.auth.controller;

import com.devguardian.constants.ApiEndpoints;
import com.devguardian.auth.dto.AuthResponse;
import com.devguardian.auth.dto.LoginRequest;
import com.devguardian.auth.dto.RegisterRequest;
import com.devguardian.auth.service.interfaces.AuthService;
import com.devguardian.config.StandardErrorResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(
        name = "Authentication APIs",
        description = "Endpoints for user registration, login, and identity management"
)
@RestController
@RequestMapping(ApiEndpoints.AUTH)
@RequiredArgsConstructor
@StandardErrorResponses
public class AuthController {

    private final AuthService authService;

    // REGISTER
    @Operation(
            summary = "Register a new user",
            description = "Creates a new developer account and returns an access token"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Registration successful"
    )
    @PostMapping(ApiEndpoints.REGISTER)
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    // LOGIN
    @Operation(
            summary = "Authenticate user",
            description = "Verifies user credentials and returns a JWT access token"
    )
    @ApiResponse(
            responseCode = "200",
            description = "Login successful"
    )
    @PostMapping(ApiEndpoints.LOGIN)
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}
