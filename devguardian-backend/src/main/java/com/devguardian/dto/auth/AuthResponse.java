package com.devguardian.dto.auth;

import com.devguardian.entity.enums.Role;
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