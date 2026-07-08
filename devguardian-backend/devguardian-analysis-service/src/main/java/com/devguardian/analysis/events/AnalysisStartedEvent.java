package com.devguardian.analysis.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisStartedEvent {

    private Long analysisId;
    private Long repositoryId;
    private String token;

}
