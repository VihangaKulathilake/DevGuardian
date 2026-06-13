package com.devguardian.analysis.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.analysis.enums.AnalysisStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Schema(description = "Response representing a repository security analysis scan")
@Getter
@Builder
public class AnalysisResponse {

    @Schema(description = "Unique analysis run identifier", example = "5001")
    private Long id;

    @Schema(description = "Database ID of the analyzed repository", example = "1001")
    private Long repositoryId;

    @Schema(description = "Current operational status of the analysis (e.g. IN_PROGRESS, COMPLETED, FAILED)", example = "COMPLETED")
    private AnalysisStatus status;

    @Schema(description = "Calculated security security score (out of 100)", example = "85")
    private Integer securityScore;

    @Schema(description = "Calculated code quality score (out of 100)", example = "90")
    private Integer qualityScore;

    @Schema(description = "Calculated code architecture design score (out of 100)", example = "95")
    private Integer architectureScore;

    @Schema(description = "Total number of vulnerability and styling issues identified", example = "3")
    private Integer totalIssues;

    @Schema(description = "Timestamp when the analysis started", example = "2026-06-13T20:16:31")
    private LocalDateTime startedAt;

    @Schema(description = "Timestamp when the analysis completed", example = "2026-06-13T20:17:45")
    private LocalDateTime completedAt;
}