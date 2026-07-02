package com.devguardian.client;

import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ai-service", path = "/api/ai")
public interface AiClient {

    @PostMapping("/enrich")
    AiIssueResponse enrichIssue(@RequestBody AiIssueRequest request);
}
