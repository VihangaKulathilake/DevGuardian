package com.devguardian.github.entity;


import com.devguardian.github.enums.ConnectionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "github_connections", uniqueConstraints = {@UniqueConstraint(columnNames = "user_id")})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GithubConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "github_user_id", nullable = false)
    private Long githubUserId;

    @Column(name = "github_username", nullable = false)
    private String githubUsername;

    @Column(name = "github_email")
    private String githubEmail;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "token_type")
    private String tokenType;

    @Column(name = "scope")
    private String scope;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ConnectionStatus status;

    @Column(name = "provider")
    private String provider = "GITHUB";

    @Column(name = "connected_at")
    private LocalDateTime connectedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.connectedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = ConnectionStatus.ACTIVE;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}