package com.devguardian.analysis.report.impl;

import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.report.interfaces.ReportGenerator;
import com.devguardian.analysis.report.model.AnalysisReportSummary;
import org.springframework.stereotype.Component;

@Component
public class DefaultReportGenerator implements ReportGenerator {

    @Override
    public AnalysisReportSummary generate(Analysis analysis) {

        int criticalIssues = (int) analysis.getIssues().stream()
                .filter(issue -> issue.getSeverity() == SeverityLevel.CRITICAL)
                .count();

        int highIssues = (int) analysis.getIssues().stream()
                .filter(issue -> issue.getSeverity() == SeverityLevel.HIGH)
                .count();

        int mediumIssues = (int) analysis.getIssues().stream()
                .filter(issue -> issue.getSeverity() == SeverityLevel.MEDIUM)
                .count();

        int lowIssues = (int) analysis.getIssues().stream()
                .filter(issue -> issue.getSeverity() == SeverityLevel.LOW)
                .count();

        return AnalysisReportSummary.builder()
                .totalIssues(analysis.getIssues().size())
                .criticalIssues(criticalIssues)
                .highIssues(highIssues)
                .mediumIssues(mediumIssues)
                .lowIssues(lowIssues)
                .securityScore(analysis.getSecurityScore())
                .qualityScore(analysis.getQualityScore())
                .architectureScore(analysis.getArchitectureScore())
                .build();
    }
}