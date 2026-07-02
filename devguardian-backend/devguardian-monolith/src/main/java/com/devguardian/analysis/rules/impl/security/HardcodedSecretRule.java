package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class HardcodedSecretRule implements AnalysisRule {

    private static final Pattern SECRET_PATTERN = Pattern.compile(
            "(?i)\\b(\\w*(?:password|secret|apiKey|token)\\w*)\\s*=\\s*[\"']([^\"']*)[\"']"
    );

    private static final Pattern FALSE_POSITIVE_VAR_PATTERN = Pattern.compile(
            "(?i)message|msg|error|err|hint|label|tooltip|placeholder|description|desc|text|title|subject|format|regex|pattern|template|prompt|invalid|success|failure|validation|display|name|header|warn|fail"
    );

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
                String line = lines[i].trim();

                // Skip comment lines
                if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
                    continue;
                }

                Matcher matcher = SECRET_PATTERN.matcher(line);
                if (matcher.find()) {
                    String varName = matcher.group(1);
                    String value = matcher.group(2).trim();

                    // Filter out variables indicating messages, UI labels, or errors
                    if (FALSE_POSITIVE_VAR_PATTERN.matcher(varName).find()) {
                        continue;
                    }

                    // Filter out sentences, placeholders, empty values, or environment calls
                    if (value.isEmpty()
                            || value.contains(" ") // Secrets do not contain spaces
                            || value.startsWith("${")
                            || value.startsWith("{{")
                            || value.equalsIgnoreCase("null")
                            || value.equalsIgnoreCase("true")
                            || value.equalsIgnoreCase("false")
                            || value.equalsIgnoreCase("dummy")
                            || value.equalsIgnoreCase("placeholder")
                            || value.equalsIgnoreCase("test")
                            || value.equalsIgnoreCase("todo")
                            || value.contains("System.get")
                            || value.length() < 4) {
                        continue;
                    }

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
