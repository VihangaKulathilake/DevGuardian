package com.devguardian.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.auth.enums.Role;
import lombok.*;

@Schema(description = "Authentication response containing JWT token and user profile details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @Schema(description = "JWT Access Token used for authenticated API calls", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBl...")
    private String token;

    @Schema(description = "Unique database ID of the user", example = "101")
    private Long userId;

    @Schema(description = "Role assigned to the user", example = "ROLE_USER")
    private Role role;

    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "User's full name", example = "John Doe")
    private String name;
}