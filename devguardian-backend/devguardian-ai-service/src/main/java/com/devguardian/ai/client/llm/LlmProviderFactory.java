package com.devguardian.ai.client.llm;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LlmProviderFactory {

    private final List<LlmProvider> providers;
    private final LlmRouterService routerService;

    public LlmProvider getProvider() {
        String activeId = routerService.getActiveProviderId();
        return providers.stream()
                .filter(p -> p.getProviderId().equalsIgnoreCase(activeId))
                .findFirst()
                .orElse(providers.get(0));
    }
}
