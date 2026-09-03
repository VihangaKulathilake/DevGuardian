package com.devguardian.analysis.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "Consolidated dashboard metrics, repository summaries, and recent security events")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    @Schema(description = "Total number of repositories owned by the user", example = "5")
    private int totalRepositories;

    @Schema(description = "Total number of scans historically run across all repositories", example = "12")
    private int totalScans;

    @Schema(description = "Average security score across all analyzed repositories (out of 100)", example = "88")
    private int avgSecurityScore;

    @Schema(description = "Calculated letter grade for overall security posture (A, B, C, D, F)", example = "B")
    private String scoreGrade;

    @Schema(description = "Total security vulnerabilities detected across latest scans", example = "4")
    private int totalVulnerabilities;

    @Schema(description = "Total code quality issues detected across latest scans", example = "7")
    private int totalCodeSmells;

    @Schema(description = "Total critical security alerts requiring immediate attention", example = "1")
    private int totalCriticalAlerts;

    @Schema(description = "Whether any completed scan data is available", example = "true")
    private boolean hasData;

    @Schema(description = "List of repository cards with their latest scan status and issue counts")
    private List<DashboardRepoSummary> repositories;

    @Schema(description = "Top recent critical and high severity security alerts")
    private List<IssueResponse> recentAlerts;

    @Schema(description = "Recent analysis and scan execution events")
    private List<DashboardActivityResponse> recentActivities;

    @Schema(description = "Historical vulnerability detection count by date")
    private List<VulnerabilityTrendPoint> vulnerabilitiesOverTime;
}

