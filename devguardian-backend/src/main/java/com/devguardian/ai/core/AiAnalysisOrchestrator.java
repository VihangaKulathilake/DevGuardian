package com.devguardian.ai.core;

import com.devguardian.ai.cache.AiResponseCacheService;
import com.devguardian.ai.client.llm.LlmProvider;
import com.devguardian.ai.mapper.AiResponseMapper;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.ai.prompt.PromptBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiAnalysisOrchestrator {

    private final LlmProvider llmProvider;
    private final PromptBuilder promptBuilder;
    private final AiResponseMapper mapper;
    private final AiResponseCacheService cacheService;

    public AiIssueResponse analyze(AiIssueRequest request) {

        String cacheKey = cacheService.buildKey(
                request.getIssueType(),
                request.getCodeSnippet()
        );

        String cached = cacheService.get(cacheKey);
        AiIssueResponse responseObj;
        if (cached != null) {
            responseObj = mapper.map(cached);
        } else {
            String prompt = promptBuilder.build(request);
            String response = llmProvider.generate(prompt);
            cacheService.put(cacheKey, response);
            responseObj = mapper.map(response);
        }

        responseObj.setModelName(llmProvider.getModelName());
        return responseObj;
    }
}