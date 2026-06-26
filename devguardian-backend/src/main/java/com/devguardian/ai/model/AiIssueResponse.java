package com.devguardian.ai.model;

import lombok.Data;

@Data
public class AiIssueResponse {
    private String explanation;
    private String impact;
    private String recommendation;
    private String modelName;
}
