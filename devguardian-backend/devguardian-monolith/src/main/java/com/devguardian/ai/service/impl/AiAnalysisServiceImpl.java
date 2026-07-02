package com.devguardian.ai.service.impl;

import com.devguardian.ai.service.interfaces.AiAnalysisService;
import com.devguardian.ai.core.AiAnalysisOrchestrator;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiAnalysisServiceImpl implements AiAnalysisService {

    private final AiAnalysisOrchestrator orchestrator;

    @Override
    public AiIssueResponse analyze(AiIssueRequest request) {
        return orchestrator.analyze(request);
    }
}