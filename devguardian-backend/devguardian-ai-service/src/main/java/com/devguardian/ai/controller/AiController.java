package com.devguardian.ai.controller;

import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.ai.service.interfaces.AiAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalysisService aiAnalysisService;

    @PostMapping("/enrich")
    public AiIssueResponse enrichIssue(@RequestBody AiIssueRequest request) {
        return aiAnalysisService.analyze(request);
    }
}
