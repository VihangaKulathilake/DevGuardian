package com.devguardian.analysis.dto.response;

import com.devguardian.analysis.enums.AnalysisStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AnalysisResponse {

    private Long id;

    private Long repositoryId;

    private AnalysisStatus status;

    private Integer securityScore;

    private Integer qualityScore;

    private Integer architectureScore;

    private Integer totalIssues;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;
}