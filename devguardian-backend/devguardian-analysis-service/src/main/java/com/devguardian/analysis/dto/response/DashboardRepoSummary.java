package com.devguardian.analysis.dto.response;

import com.devguardian.analysis.enums.AnalysisStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "Summary of a repository and its latest scan analysis metrics")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardRepoSummary {
    @Schema(description = "Repository identifier", example = "1")
    private Long id;

    @Schema(description = "Repository name", example = "devguardian-backend")
    private String name;

    @Schema(description = "Repository remote URL", example = "https://github.com/user/devguardian-backend")
    private String url;

    @Schema(description = "Repository visibility (e.g. PUBLIC, PRIVATE)", example = "PUBLIC")
    private String visibility;

    @Schema(description = "Repository primary programming language", example = "Java")
    private String language;

    @Schema(description = "Repository branch", example = "main")
    private String branch;

    @Schema(description = "Repository provider (e.g. GITHUB, LOCAL)", example = "GITHUB")
    private String provider;

    @Schema(description = "ID of the most recent analysis scan run", example = "5001")
    private Long latestAnalysisId;

    @Schema(description = "Status of the latest scan", example = "COMPLETED")
    private AnalysisStatus status;

    @Schema(description = "Latest calculated security score (out of 100)", example = "95")
    private Integer securityScore;

    @Schema(description = "Latest calculated quality score (out of 100)", example = "88")
    private Integer qualityScore;

    @Schema(description = "Timestamp when the repository was last analyzed")
    private LocalDateTime lastAnalyzed;

    @Schema(description = "Count of critical severity issues", example = "0")
    private int criticalIssues;

    @Schema(description = "Count of warning (high & medium) severity issues", example = "1")
    private int warningIssues;

    @Schema(description = "Count of info (low & info) severity issues", example = "2")
    private int infoIssues;

    @Schema(description = "Total issues detected in latest scan", example = "3")
    private int totalIssues;
}

