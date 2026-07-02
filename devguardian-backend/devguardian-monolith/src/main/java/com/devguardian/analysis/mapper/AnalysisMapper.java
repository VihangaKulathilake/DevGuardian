package com.devguardian.analysis.mapper;

import com.devguardian.analysis.dto.response.AnalysisResponse;
import com.devguardian.analysis.entity.Analysis;
import org.springframework.stereotype.Component;

@Component
public class AnalysisMapper {

    public AnalysisResponse toResponse(Analysis analysis) {

        return AnalysisResponse.builder()
                .id(analysis.getId())
                .repositoryId(analysis.getRepositoryId())
                .status(analysis.getStatus())
                .securityScore(analysis.getSecurityScore())
                .qualityScore(analysis.getQualityScore())
                .architectureScore(analysis.getArchitectureScore())
                .totalIssues(analysis.getIssues().size())
                .startedAt(analysis.getStartedAt())
                .completedAt(analysis.getCompletedAt())
                .build();
    }
}