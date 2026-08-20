package com.devguardian.ai.controller;

import com.devguardian.ai.client.llm.LlmRouterService;
import com.devguardian.ai.client.llm.LlmRouterService.ModelStatusDto;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.ai.service.interfaces.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiAnalysisService;
    private final LlmRouterService llmRouterService;

    @PostMapping("/enrich")
    public AiIssueResponse enrichIssue(@RequestBody AiIssueRequest request) {
        return aiAnalysisService.analyze(request);
    }

    @GetMapping("/models")
    public List<ModelStatusDto> getAvailableModels() {
        return llmRouterService.getAvailableModels();
    }

    @PostMapping("/models/active")
    public Map<String, Object> setActiveModel(@RequestParam("provider") String provider) {
        llmRouterService.setActiveProvider(provider);
        return Map.of(
                "success", true,
                "activeProvider", llmRouterService.getActiveProviderId(),
                "message", "Active LLM provider successfully updated"
        );
    }
}
