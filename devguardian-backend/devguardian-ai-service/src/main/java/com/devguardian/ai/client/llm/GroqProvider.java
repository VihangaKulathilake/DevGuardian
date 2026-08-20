package com.devguardian.ai.client.llm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroqProvider implements LlmProvider {

    private final WebClient webClient;

    @Value("${groq.api.key:}")
    private String apiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String model;

    @Override
    public String getProviderId() {
        return "groq";
    }

    @Override
    public String getDisplayName() {
        return "Groq (Meta Llama 3.3 70B)";
    }

    @Override
    public String getModelName() {
        return model;
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("groq_key");
    }

    @Override
    @SuppressWarnings("unchecked")
    public String generate(String prompt) {
        if (!isConfigured()) {
            throw new IllegalStateException("Groq API key is not configured.");
        }

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "You are a senior software security engineer and automated code remediation expert."
                        ),
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "temperature", 0.2
        );

        Map<String, Object> response = webClient.post()
                .uri("https://api.groq.com/openai/v1/chat/completions")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        clientResponse -> clientResponse.bodyToMono(String.class)
                                .map(bodyStr -> new RuntimeException("Groq API error [" + clientResponse.statusCode() + "]: " + bodyStr))
                )
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .block();

        if (response == null) {
            throw new RuntimeException("Empty response received from Groq API.");
        }

        log.debug("Groq Response: {}", response);

        List<Map<String, Object>> choices =
                (List<Map<String, Object>>) response.get("choices");

        if (choices == null || choices.isEmpty()) {
            return "";
        }

        Map<String, Object> message =
                (Map<String, Object>) choices.get(0).get("message");

        if (message == null) {
            return "";
        }

        return (String) message.get("content");
    }
}