package com.devguardian.ai.model;

import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class AiIssueRequest {
    private String issueType;
    private String fileName;
    private String codeSnippet;
    private String description;
    private String preferredProvider;
}
