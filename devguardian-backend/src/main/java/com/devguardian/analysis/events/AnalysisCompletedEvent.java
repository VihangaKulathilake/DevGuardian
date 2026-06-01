package com.devguardian.analysis.events;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalysisCompletedEvent {
    private Long analysisId;
    private Long repositoryId;
}
