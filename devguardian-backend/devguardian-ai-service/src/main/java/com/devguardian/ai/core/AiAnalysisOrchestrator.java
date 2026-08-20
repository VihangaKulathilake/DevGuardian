package com.devguardian.ai.core;

import com.devguardian.ai.cache.AiResponseCacheService;
import com.devguardian.ai.client.llm.LlmRouterService;
import com.devguardian.ai.client.llm.LlmRouterService.LlmExecutionResult;
import com.devguardian.ai.mapper.AiResponseMapper;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.ai.prompt.PromptBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiAnalysisOrchestrator {

    private final LlmRouterService llmRouterService;
    private final PromptBuilder promptBuilder;
    private final AiResponseMapper mapper;
    private final AiResponseCacheService cacheService;

    public AiIssueResponse analyze(AiIssueRequest request) {

        String requestedProvider = request.getPreferredProvider();
        String cacheKey = cacheService.buildKey(
                request.getIssueType() + "_" + (requestedProvider != null ? requestedProvider : llmRouterService.getActiveProviderId()),
                request.getCodeSnippet()
        );

        String cached = cacheService.get(cacheKey);
        AiIssueResponse responseObj;

        if (cached != null) {
            responseObj = mapper.map(cached);
            responseObj.setModelName(llmRouterService.getActiveProviderId());
            responseObj.setActiveProvider(llmRouterService.getActiveProviderId());
            responseObj.setFallbackTriggered(false);
        } else {
            String prompt = promptBuilder.build(request);
            LlmExecutionResult result = llmRouterService.executeWithFailover(prompt, requestedProvider);
            cacheService.put(cacheKey, result.getResponse());

            responseObj = mapper.map(result.getResponse());
            responseObj.setModelName(result.getModelName());
            responseObj.setActiveProvider(result.getActiveProvider());
            responseObj.setFallbackTriggered(result.isFallbackTriggered());
            responseObj.setPrimaryModel(result.getPrimaryModel());
            responseObj.setFallbackReason(result.getFallbackReason());
        }

        return responseObj;
    }
}