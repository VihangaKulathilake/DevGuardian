package com.devguardian.repository.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.repository.enums.*;
import lombok.*;

import java.time.LocalDateTime;

@Schema(description = "Repository Information Response representing a code repository configured in DevGuardian")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryResponse {

    @Schema(description = "Unique repository identifier", example = "1001")
    private Long id;

    @Schema(description = "Name of the code repository", example = "devguardian-backend")
    private String name;

    @Schema(description = "Remote git clone URL", example = "https://github.com/devguardian/devguardian-backend.git")
    private String url;

    @Schema(description = "Full name of the repository (owner/name)", example = "devguardian/devguardian-backend")
    private String fullName;

    @Schema(description = "GitHub Repository ID", example = "123456789")
    private Long githubRepoId;

    @Schema(description = "Remote git clone URL (same as url)", example = "https://github.com/devguardian/devguardian-backend.git")
    private String cloneUrl;

    @Schema(description = "Repository purpose details", example = "Backend core API monolith for AI DevSecOps scans")
    private String description;

    @Schema(description = "Primary programming language of the codebase", example = "Java")
    private String language;

    @Schema(description = "Target git branch for analyses", example = "main")
    private String branch;

    @Schema(description = "Hosting service provider", example = "GITHUB")
    private RepositoryProvider provider;

    @Schema(description = "Repository visibility level", example = "PRIVATE")
    private Visibility visibility;

    @Schema(description = "Repository setup/operational status (e.g. ACTIVE, ARCHIVED, ERROR)", example = "ACTIVE")
    private RepositoryStatus status;

    @Schema(description = "Type of code repository", example = "BACKEND")
    private RepositoryType type;

    @Schema(description = "Frequency of background code scans", example = "DAILY")
    private ScanFrequency scanFrequency;

    @Schema(description = "Creation date and time of the configuration", example = "2026-06-13T20:16:31")
    private LocalDateTime createdAt;

    @Schema(description = "Imported date and time of the configuration", example = "2026-06-13T20:16:31")
    private LocalDateTime importedAt;
}
