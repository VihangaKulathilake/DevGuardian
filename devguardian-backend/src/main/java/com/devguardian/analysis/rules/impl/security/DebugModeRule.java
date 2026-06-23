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
public class DebugModeRule implements AnalysisRule {

    private static final Pattern DEBUG_PATTERN =
            Pattern.compile("(debug\\s*=\\s*true|debug\\s*:\\s*true)",
                    Pattern.CASE_INSENSITIVE);

    @Override
    public String getRuleCode() {
        return "DEBUG_MODE_RULE";
    }

    @Override
    public String getName() {
        return "Debug Mode Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {

        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {

            String[] lines = content.split("\n");

            for (int i = 0; i < lines.length; i++) {

                if (DEBUG_PATTERN.matcher(lines[i]).find()) {

                    issues.add(
                            Issue.builder()
                                    .ruleCode(getRuleCode())
                                    .title("Debug Mode Enabled")
                                    .description("Debug mode is enabled in configuration.")
                                    .severity(SeverityLevel.MEDIUM)
                                    .category(IssueCategory.CONFIGURATION)
                                    .filePath(filePath)
                                    .lineNumber(i + 1)
                                    .recommendation("Disable debug mode before deployment.")
                                    .build()
                    );
                }
            }
        });

        return issues;
    }
}
