package com.devguardian.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "Asgardeo OAuth authentication payload")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsgardeoAuthRequest {

    @Schema(description = "Authorization code returned by Asgardeo OIDC", example = "a1b2c3d4...")
    private String code;

    @Schema(description = "Redirect URI used during authorization", example = "http://localhost:3000/auth/callback")
    private String redirectUri;

    @Schema(description = "PKCE code verifier", example = "dBjftJeZ4CVP-mB92K27uhbUJu1p1r_wW1gFWFOEjXk")
    private String codeVerifier;

    @Schema(description = "Direct ID token if exchanged on frontend", example = "eyJhbGci...")
    private String idToken;
}

