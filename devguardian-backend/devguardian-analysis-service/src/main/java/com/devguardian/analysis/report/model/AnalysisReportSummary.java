package com.devguardian.analysis.report.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnalysisReportSummary {

    private final Integer totalIssues;

    private final Integer criticalIssues;

    private final Integer highIssues;

    private final Integer mediumIssues;

    private final Integer lowIssues;

    private final Integer securityScore;

    private final Integer qualityScore;

    private final Integer architectureScore;
}