package com.devguardian.ai.prompt;

import com.devguardian.ai.model.AiIssueRequest;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String build(AiIssueRequest req) {
        return String.format(
                PromptTemplate.ISSUE_ANALYSIS_PROMPT,
                req.getIssueType(),
                req.getFileName(),
                req.getCodeSnippet(),
                req.getDescription()
        );
    }
}