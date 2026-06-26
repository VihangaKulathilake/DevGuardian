package com.devguardian.ai.client.llm;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LlmProviderFactory {

    private final LlmProvider provider;

    public LlmProvider getProvider() {
        return provider;
    }
}
