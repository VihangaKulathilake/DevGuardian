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
public class HardcodedSecretRule implements AnalysisRule {

    private static final Pattern SECRET_PATTERN = Pattern.compile("(password|secret|apiKey|token)\\s*=\\s*[\"'].*[\"']", Pattern.CASE_INSENSITIVE);

    @Override
    public String getRuleCode() {
        return "HARDCODED_SECRET_RULE";
    }

    @Override
    public String getName() {
        return "Hardcoded Secret Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {

        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {

            String[] lines = content.split("\n");

            for (int i = 0; i < lines.length; i++) {

                if (SECRET_PATTERN.matcher(lines[i]).find()) {

                    Issue issue = Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("Hardcoded Secret Detected")
                            .description("Sensitive data found in source code")
                            .severity(SeverityLevel.CRITICAL)
                            .category(IssueCategory.SECURITY)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Move secrets to environment variables or secret manager")
                            .build();

                    issues.add(issue);
                }
            }
        });

        return issues;
    }
}
