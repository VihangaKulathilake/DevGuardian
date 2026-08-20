package com.devguardian.ai.client.llm;

public interface LlmProvider {

    String getProviderId();
    String getDisplayName();
    String getModelName();
    boolean isConfigured();
    String generate(String prompt);
}
