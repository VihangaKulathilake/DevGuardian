package com.devguardian.analysis.scoring.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScoreResult {

    private final Integer securityScore;

    private final Integer qualityScore;

    private final Integer architectureScore;
}