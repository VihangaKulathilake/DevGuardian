package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class WildcardCorsRule implements AnalysisRule {

    private static final Pattern CORS_PATTERN = Pattern.compile(
            "(@CrossOrigin\\s*\\(\\s*(?:origins\\s*=\\s*)?\"\\*\"\\s*\\)|\\.allowedOrigins\\s*\\(\\s*\"\\*\"\\s*\\)|\\.allowedOriginPatterns\\s*\\(\\s*\"\\*\"\\s*\\))"
    );

    @Override
    public String getRuleCode() {
        return "WILDCARD_CORS_RULE";
    }

    @Override
    public String getName() {
        return "Wildcard CORS Origin Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            if (!filePath.endsWith(".java")) {
                return; // CORS wildcards are usually configured in Java source files
            }

            String[] lines = content.split("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                if (CORS_PATTERN.matcher(line).find()) {
                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("Wildcard CORS Origin Allowed")
                            .description("CORS configuration allows requests from any origin ('*'). This can expose sensitive resources to cross-origin attacks.")
                            .severity(SeverityLevel.MEDIUM)
                            .category(IssueCategory.SECURITY)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Specify exact origins instead of the wildcard '*' (e.g., allowedOrigins(\"https://app.devguardian.com\")), or load allowed origins from configuration.")
                            .build());
                }
            }
        });

        return issues;
    }
}
