package com.devguardian.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "User Login Request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Schema(
            description = "Email Address",
            example = "admin@example.com"
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Schema(
            description = "Password",
            example = "password123"
    )
    private String password;
}
