package com.devguardian.analysis.dto.response;

import com.devguardian.analysis.enums.AnalysisStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Schema(description = "Activity log entry representing recent scan events")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardActivityResponse {
    @Schema(description = "Action name", example = "Scan Completed")
    private String action;

    @Schema(description = "Repository name", example = "my-backend-service")
    private String repoName;

    @Schema(description = "Event details", example = "Completed scan with score 92/100 and 2 issues.")
    private String details;

    @Schema(description = "Timestamp of the event")
    private LocalDateTime timestamp;

    @Schema(description = "Status of the scan", example = "COMPLETED")
    private AnalysisStatus status;

    @Schema(description = "Security score result", example = "92")
    private Integer securityScore;

    @Schema(description = "Total issues detected", example = "2")
    private Integer totalIssues;
}

