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
public class AwsCredentialRule implements AnalysisRule {

    // Matches AWS Access Key ID: AKIA or ASIA prefix followed by 16 alphanumeric characters
    private static final Pattern AWS_ACCESS_KEY_PATTERN = Pattern.compile(
            "\\b((?:AKIA|ASIA)[0-9A-Z]{16})\\b"
    );

    // Matches AWS Secret Access Key variable assignments with 40 character high entropy keys
    private static final Pattern AWS_SECRET_KEY_PATTERN = Pattern.compile(
            "(?i)\\b(?:aws[-_]?secret|aws[-_]?secret[-_]?(?:access)?[-_]?key|secret[-_]?key)\\s*[:=]\\s*[\"']?([A-Za-z0-9/+=]{40})[\"']?"
    );

    @Override
    public String getRuleCode() {
        return "AWS_CREDENTIAL_RULE";
    }

    @Override
    public String getName() {
        return "AWS Credential Exposure Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            String[] lines = content.split("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();

                // Skip comments
                if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
                    continue;
                }

                // 1. Check for AWS Access Key ID
                Matcher accessMatcher = AWS_ACCESS_KEY_PATTERN.matcher(line);
                if (accessMatcher.find()) {
                    String accessKey = accessMatcher.group(1);
                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("AWS Access Key Exposed")
                            .description("An AWS Access Key ID ('" + accessKey + "') was found in the codebase. Exposed AWS credentials can lead to unauthorized cloud resource access, billing spikes, and full account takeover.")
                            .severity(SeverityLevel.CRITICAL)
                            .category(IssueCategory.SECRET_MANAGEMENT)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Revoke this AWS Access Key immediately in the AWS IAM Console. Rotate credentials and configure IAM roles or load keys from secure environments.")
                            .build());
                    continue; // Skip secret check if access key is already flagged on this line
                }

                // 2. Check for AWS Secret Access Key
                Matcher secretMatcher = AWS_SECRET_KEY_PATTERN.matcher(line);
                if (secretMatcher.find()) {
                    String secretKey = secretMatcher.group(1);
                    if (secretKey.startsWith("${")) {
                        continue; // Reference placeholder
                    }

                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("AWS Secret Access Key Exposed")
                            .description("An AWS Secret Access Key was found hardcoded. In combination with an access key, this allows full administrative API access to your AWS infrastructure.")
                            .severity(SeverityLevel.CRITICAL)
                            .category(IssueCategory.SECRET_MANAGEMENT)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Revoke and rotate AWS credentials immediately. Do not store AWS credentials in version control.")
                            .build());
                }
            }
        });

        return issues;
    }
}
