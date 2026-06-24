package com.devguardian.ai.client.llm;

public interface LlmProvider {
    String generate(String prompt);
}
