package com.devguardian.repository.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.repository.enums.RepositoryProvider;
import com.devguardian.repository.enums.RepositoryType;
import com.devguardian.repository.enums.ScanFrequency;
import com.devguardian.repository.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Schema(description = "Repository Creation Request payload")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRepositoryRequest {

    @NotBlank
    @Schema(description = "Name of the code repository", example = "devguardian-backend")
    private String name;

    @NotBlank
    @Schema(description = "Remote git clone URL of the repository", example = "https://github.com/devguardian/devguardian-backend.git")
    private String url;

    @Schema(description = "Short description of the repository purpose", example = "Backend core API monolith for AI DevSecOps scans")
    private String description;

    @Schema(description = "Primary programming language of the codebase", example = "Java")
    private String language;

    @Schema(description = "Default git branch to pull for vulnerability analysis", example = "main")
    private String branch;

    @Schema(description = "Git service hosting provider (e.g. GITHUB, BITBUCKET, GitLab)", example = "GITHUB")
    private RepositoryProvider provider;

    @Schema(description = "Repository accessibility status", example = "PRIVATE")
    private Visibility visibility;

    @Schema(description = "Type of code repository (e.g. BACKEND, FRONTEND, MOBILE, IAC)", example = "BACKEND")
    private RepositoryType type;

    @Schema(description = "Automatic background scan schedule frequency", example = "DAILY")
    private ScanFrequency scanFrequency;
}
