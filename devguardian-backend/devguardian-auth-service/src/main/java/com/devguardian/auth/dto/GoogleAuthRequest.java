package com.devguardian.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Schema(description = "Google OAuth authentication payload containing client ID token")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @Schema(description = "Google ID Token (JWT) issued by Google Identity Services", example = "eyJhbGciOiJSUzI1NiIs...")
    @NotBlank(message = "Google ID token is required")
    private String idToken;
}

