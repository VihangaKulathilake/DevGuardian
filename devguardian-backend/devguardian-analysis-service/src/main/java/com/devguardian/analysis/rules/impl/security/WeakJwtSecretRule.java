package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class WeakJwtSecretRule implements AnalysisRule {

    private static final Set<String> WEAK_SECRETS = new HashSet<>(Arrays.asList(
            "test", "secret", "password", "123456", "12345678", "admin", "dev", "development",
            "jwtsecret", "mysecret", "secretkey", "signature", "token", "default", "demo"
    ));

    // Match assignments of JWT secrets in properties, yaml, and Java
    private static final Pattern JWT_SECRET_PATTERN = Pattern.compile(
            "(jwt\\.secret|jwt-secret|jwtSecret)\\s*[:=]\\s*[\"']?([^\"'\\s]+)[\"']?",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public String getRuleCode() {
        return "WEAK_JWT_SECRET_RULE";
    }

    @Override
    public String getName() {
        return "Weak JWT Secret Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            String[] lines = content.split("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();
                if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
                    continue; // Skip comments
                }

                Matcher matcher = JWT_SECRET_PATTERN.matcher(line);
                if (matcher.find()) {
                    String value = matcher.group(2).trim();

                    // Check for environment variable references like ${JWT_SECRET}
                    // Extract default fallback if present, e.g. ${JWT_SECRET:fallback}
                    if (value.startsWith("${") && value.endsWith("}")) {
                        int colonIndex = value.indexOf(':');
                        if (colonIndex != -1 && colonIndex < value.length() - 1) {
                            value = value.substring(colonIndex + 1, value.length() - 1).trim();
                        } else {
                            continue; // Reference to environment variable only - safe
                        }
                    }

                    // Clean the value of trailing/leading quotes just in case
                    value = value.replaceAll("^[\"']|[\"']$", "").trim();

                    if (value.isEmpty()) {
                        continue;
                    }

                    boolean isWeak = WEAK_SECRETS.contains(value.toLowerCase()) || value.length() < 32;

                    if (isWeak) {
                        issues.add(Issue.builder()
                                .ruleCode(getRuleCode())
                                .title("Weak JWT Secret Key")
                                .description("A weak or short JWT secret key was detected. Secrets must be at least 256 bits (32 characters) long and should not be common words.")
                                .severity(SeverityLevel.HIGH)
                                .category(IssueCategory.SECRET_MANAGEMENT)
                                .filePath(filePath)
                                .lineNumber(i + 1)
                                .recommendation("Configure a high-entropy secret of at least 32 characters or load it securely via environment variables using ${JWT_SECRET} without a weak default fallback.")
                                .build());
                    }
                }
            }
        });

        return issues;
    }
}
