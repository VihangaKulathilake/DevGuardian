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
public class ApiKeyExposureRule implements AnalysisRule {

    // Matches API keys assignments: e.g., apiKey = "AIzaSyD-aB1c2D3e4F5g6H7i8J9k0L"
    private static final Pattern API_KEY_PATTERN = Pattern.compile(
            "(?i)\\b(api[-_]?key|x[-_]api[-_]key|client[-_]secret|stripe[-_]key|sendgrid[-_]key)\\s*[:=]\\s*[\"']?([a-zA-Z0-9-_]{16,})[\"']?"
    );

    @Override
    public String getRuleCode() {
        return "API_KEY_EXPOSURE_RULE";
    }

    @Override
    public String getName() {
        return "API Key Exposure Detection";
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

                Matcher matcher = API_KEY_PATTERN.matcher(line);
                if (matcher.find()) {
                    String value = matcher.group(2).trim();

                    // False-positive mitigations
                    if (value.startsWith("${") 
                            || value.equalsIgnoreCase("null")
                            || value.equalsIgnoreCase("true")
                            || value.equalsIgnoreCase("false")
                            || value.equals("placeholder")
                            || value.contains("System.")
                            || value.length() < 16) {
                        continue;
                    }

                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("API Key Exposed")
                            .description("An API key or Client Secret was found hardcoded in the codebase. If leaked, unauthorized parties can access third-party integrations, incurring costs or exposing data.")
                            .severity(SeverityLevel.CRITICAL)
                            .category(IssueCategory.SECRET_MANAGEMENT)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Revoke this credential immediately. Use environment variables (e.g. System.getenv(\"API_KEY\")) or external vaults to store integration secrets.")
                            .build());
                }
            }
        });

        return issues;
    }
}
