package com.devguardian.ai.service.interfaces;

import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;

public interface AiAnalysisService {
    AiIssueResponse analyze(AiIssueRequest request);
}
