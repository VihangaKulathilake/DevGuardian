package com.devguardian.analysis.mapper;

import com.devguardian.analysis.dto.response.AnalysisResponse;
import com.devguardian.analysis.dto.response.IssueResponse;
import com.devguardian.analysis.entity.Analysis;
import com.devguardian.analysis.entity.Issue;
import org.springframework.stereotype.Component;

@Component
public class AnalysisMapper {

    public AnalysisResponse toResponse(Analysis analysis) {

        return AnalysisResponse.builder()
                .id(analysis.getId())
                .repositoryId(analysis.getRepository().getId())
                .status(analysis.getStatus())
                .securityScore(analysis.getSecurityScore())
                .qualityScore(analysis.getQualityScore())
                .architectureScore(analysis.getArchitectureScore())
                .totalIssues(analysis.getIssues().size())
                .startedAt(analysis.getStartedAt())
                .completedAt(analysis.getCompletedAt())
                .build();
    }

    public IssueResponse toIssueResponse(Issue issue) {

        return IssueResponse.builder()
                .id(issue.getId())
                .ruleCode(issue.getRuleCode())
                .category(issue.getCategory())
                .severity(issue.getSeverity())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .filePath(issue.getFilePath())
                .lineNumber(issue.getLineNumber())
                .recommendation(issue.getRecommendation())
                .build();
    }
}