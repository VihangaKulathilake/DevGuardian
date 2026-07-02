package com.devguardian.ai.client.llm;

public interface LlmProvider {

    String getModelName();
    String generate(String prompt);
}
