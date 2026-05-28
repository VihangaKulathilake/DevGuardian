package com.devguardian.auth.dto;

import com.devguardian.auth.enums.Role;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private Long userId;

    private Role role;

    private String email;

    private String name;
}