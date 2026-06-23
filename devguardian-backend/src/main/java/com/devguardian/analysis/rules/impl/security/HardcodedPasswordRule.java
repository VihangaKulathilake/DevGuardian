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
public class HardcodedPasswordRule implements AnalysisRule {

    // Match Java assignments: variable containing 'password', 'passwd', or 'pwd' assigned a double-quoted literal
    private static final Pattern JAVA_PASSWORD_PATTERN = Pattern.compile(
            "(?i)\\b(?:password|passwd|pwd)\\s*=\\s*\"([^\"]+)\""
    );

    // Match properties/YAML assignments: key containing 'password', 'passwd', or 'pwd' assigned a non-placeholder value
    private static final Pattern PROP_PASSWORD_PATTERN = Pattern.compile(
            "(?i)\\b[\\w\\.-]*(?:password|passwd|pwd)[\\w\\.-]*\\s*[:=]\\s*([^\\s#\"'${]+)"
    );

    @Override
    public String getRuleCode() {
        return "HARDCODED_PASSWORD_RULE";
    }

    @Override
    public String getName() {
        return "Hardcoded Password Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            String[] lines = content.split("\n");
            boolean isJava = filePath.endsWith(".java");
            boolean isPropOrYml = filePath.endsWith(".properties") || filePath.endsWith(".yml") || filePath.endsWith(".yaml");

            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();

                // Skip comment lines
                if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
                    continue;
                }

                String possiblePassword = null;

                if (isJava) {
                    Matcher matcher = JAVA_PASSWORD_PATTERN.matcher(line);
                    if (matcher.find()) {
                        possiblePassword = matcher.group(1).trim();
                    }
                } else if (isPropOrYml) {
                    Matcher matcher = PROP_PASSWORD_PATTERN.matcher(line);
                    if (matcher.find()) {
                        possiblePassword = matcher.group(1).trim();
                    }
                }

                if (possiblePassword != null) {
                    // Filter out trivial placeholders, empty strings, variable invocations, or property expansion
                    if (possiblePassword.isEmpty() 
                            || possiblePassword.equalsIgnoreCase("null")
                            || possiblePassword.startsWith("${") 
                            || possiblePassword.contains("System.get")
                            || possiblePassword.equals("\"\"")
                            || possiblePassword.length() < 3) {
                        continue;
                    }

                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("Hardcoded Password Detected")
                            .description("A hardcoded password or credential was detected in the file. Hardcoded secrets are easily extracted from version control systems.")
                            .severity(SeverityLevel.HIGH)
                            .category(IssueCategory.SECRET_MANAGEMENT)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Remove the plaintext password and load it from environment variables or a secure configuration service.")
                            .build());
                }
            }
        });

        return issues;
    }
}
