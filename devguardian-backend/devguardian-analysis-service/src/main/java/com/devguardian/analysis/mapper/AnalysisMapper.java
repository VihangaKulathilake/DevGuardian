package com.devguardian.analysis.mapper;

import com.devguardian.analysis.dto.response.AnalysisResponse;
import com.devguardian.analysis.entity.Analysis;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

@Component
public class AnalysisMapper {

    public AnalysisResponse toResponse(Analysis analysis) {
        int totalIssues = 0;
        if (analysis.getIssues() != null && Hibernate.isInitialized(analysis.getIssues())) {
            totalIssues = analysis.getIssues().size();
        }
        return toResponse(analysis, totalIssues);
    }

    public AnalysisResponse toResponse(Analysis analysis, int totalIssues) {
        return AnalysisResponse.builder()
                .id(analysis.getId())
                .repositoryId(analysis.getRepositoryId())
                .status(analysis.getStatus())
                .securityScore(analysis.getSecurityScore())
                .qualityScore(analysis.getQualityScore())
                .architectureScore(analysis.getArchitectureScore())
                .totalIssues(totalIssues)
                .startedAt(analysis.getStartedAt())
                .completedAt(analysis.getCompletedAt())
                .build();
    }
}