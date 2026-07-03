package com.devguardian.analysis.events;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AnalysisStartedEvent {

    private final Long analysisId;
    private final Long repositoryId;
    private final String token;

}
