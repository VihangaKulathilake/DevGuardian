package com.devguardian.ai.client.llm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmRouterService {

    private final List<LlmProvider> providers;

    @Value("${ai.provider:groq}")
    private String defaultProvider;

    private volatile String activeProviderId = "groq";
    private final Map<String, LlmProvider> providerMap = new ConcurrentHashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelStatusDto {
        private String providerId;
        private String displayName;
        private String modelName;
        private boolean configured;
        private boolean active;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LlmExecutionResult {
        private String response;
        private String modelName;
        private String activeProvider;
        private boolean fallbackTriggered;
        private String primaryModel;
        private String fallbackReason;
    }

    @PostConstruct
    public void init() {
        for (LlmProvider p : providers) {
            providerMap.put(p.getProviderId().toLowerCase(), p);
            log.info("Registered LLM Provider: [{}] -> {} (configured={})", p.getProviderId(), p.getDisplayName(), p.isConfigured());
        }

        if (providerMap.containsKey(defaultProvider.toLowerCase()) && providerMap.get(defaultProvider.toLowerCase()).isConfigured()) {
            activeProviderId = defaultProvider.toLowerCase();
        } else {
            // Find first configured provider as default
            for (LlmProvider p : providers) {
                if (p.isConfigured()) {
                    activeProviderId = p.getProviderId().toLowerCase();
                    break;
                }
            }
        }
        log.info("Active default LLM Provider set to: [{}]", activeProviderId);
    }

    public List<ModelStatusDto> getAvailableModels() {
        List<ModelStatusDto> list = new ArrayList<>();
        for (LlmProvider p : providers) {
            list.add(ModelStatusDto.builder()
                    .providerId(p.getProviderId())
                    .displayName(p.getDisplayName())
                    .modelName(p.getModelName())
                    .configured(p.isConfigured())
                    .active(p.getProviderId().equalsIgnoreCase(activeProviderId))
                    .build());
        }
        return list;
    }

    public void setActiveProvider(String providerId) {
        if (providerId != null && providerMap.containsKey(providerId.toLowerCase())) {
            activeProviderId = providerId.toLowerCase();
            log.info("Switched active LLM provider to: [{}]", activeProviderId);
        } else {
            throw new IllegalArgumentException("Unknown LLM provider: " + providerId);
        }
    }

    public String getActiveProviderId() {
        return activeProviderId;
    }

    public LlmExecutionResult executeWithFailover(String prompt, String requestedProvider) {
        String targetProviderId = (requestedProvider != null && !requestedProvider.isBlank() && providerMap.containsKey(requestedProvider.toLowerCase()))
                ? requestedProvider.toLowerCase()
                : activeProviderId;

        LlmProvider primary = providerMap.get(targetProviderId);
        if (primary == null) {
            primary = providers.get(0);
        }

        String primaryModelName = primary.getModelName();
        String primaryDisplayName = primary.getDisplayName();

        // Attempt 1: Call Primary Provider
        try {
            if (!primary.isConfigured()) {
                throw new IllegalStateException("Primary provider [" + primary.getDisplayName() + "] API key is not configured.");
            }
            log.info("Executing LLM generation with primary provider: [{}]", primary.getDisplayName());
            String response = primary.generate(prompt);
            return LlmExecutionResult.builder()
                    .response(response)
                    .modelName(primary.getModelName())
                    .activeProvider(primary.getProviderId())
                    .fallbackTriggered(false)
                    .primaryModel(primaryModelName)
                    .fallbackReason(null)
                    .build();
        } catch (Exception ex) {
            log.warn("Primary LLM provider [{}] failed (rate-limit/error): {}. Initiating automatic failover...", primary.getDisplayName(), ex.getMessage());

            // Attempt 2: Find alternate configured fallback provider
            LlmProvider fallback = null;
            for (LlmProvider p : providers) {
                if (!p.getProviderId().equalsIgnoreCase(primary.getProviderId()) && p.isConfigured()) {
                    fallback = p;
                    break;
                }
            }

            if (fallback == null) {
                log.error("No configured fallback LLM provider available.");
                throw new RuntimeException("Primary LLM provider failed and no backup configured: " + ex.getMessage(), ex);
            }

            try {
                log.info("Failing over to backup LLM provider: [{}]", fallback.getDisplayName());
                String fallbackResponse = fallback.generate(prompt);
                String reason = "Rate limit or quota threshold reached on " + primaryDisplayName + ". Automatically switched to " + fallback.getDisplayName() + ".";

                return LlmExecutionResult.builder()
                        .response(fallbackResponse)
                        .modelName(fallback.getModelName())
                        .activeProvider(fallback.getProviderId())
                        .fallbackTriggered(true)
                        .primaryModel(primaryModelName)
                        .fallbackReason(reason)
                        .build();
            } catch (Exception fallbackEx) {
                log.error("Fallback LLM provider [{}] also failed: {}", fallback.getDisplayName(), fallbackEx.getMessage());
                throw new RuntimeException("All LLM providers failed. Primary: [" + ex.getMessage() + "], Backup: [" + fallbackEx.getMessage() + "]");
            }
        }
    }
}
