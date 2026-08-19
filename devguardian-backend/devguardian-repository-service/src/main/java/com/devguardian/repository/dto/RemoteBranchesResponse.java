package com.devguardian.repository.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Remote repository branch discovery response")
public class RemoteBranchesResponse {

    @Schema(description = "Detected default branch for the repository (e.g. main or master)", example = "main")
    private String defaultBranch;

    @Schema(description = "List of all discovered remote branches", example = "[\"main\", \"dev\", \"feature/v2\"]")
    private List<String> branches;
}
