package com.devguardian.repository.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.repository.enums.RepositoryType;
import com.devguardian.repository.enums.ScanFrequency;
import com.devguardian.repository.enums.Visibility;

import lombok.*;

@Schema(description = "Repository Modification Request payload")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRepositoryRequest {

    @Schema(description = "Updated name of the repository", example = "devguardian-backend-renamed")
    private String name;

    @Schema(description = "Updated description of the repository", example = "Renamed backend repository for vulnerability analysis")
    private String description;

    @Schema(description = "Updated primary programming language", example = "Kotlin")
    private String language;

    @Schema(description = "Updated default git branch to analyze", example = "develop")
    private String branch;

    @Schema(description = "Updated repository accessibility status", example = "PUBLIC")
    private Visibility visibility;

    @Schema(description = "Updated type of code repository", example = "BACKEND")
    private RepositoryType type;

    @Schema(description = "Updated background scan schedule frequency", example = "WEEKLY")
    private ScanFrequency scanFrequency;
}
