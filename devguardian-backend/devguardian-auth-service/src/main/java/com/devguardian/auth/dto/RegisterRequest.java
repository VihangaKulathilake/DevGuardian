package com.devguardian.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Schema(description = "User Registration Request payload")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Schema(description = "User's full name", example = "John Doe")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Schema(description = "User's business email address", example = "john.doe@example.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    @Schema(description = "User's secure password (min 8 characters)", example = "securityPassword123")
    private String password;
}
