package com.devguardian.analysis.rules.impl;

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
public class SqlInjectionRule implements AnalysisRule {

    private static final Pattern SQL_PATTERN =
            Pattern.compile("SELECT.*\\+|INSERT.*\\+|UPDATE.*\\+|DELETE.*\\+",
                    Pattern.CASE_INSENSITIVE);

    @Override
    public String getRuleCode() {
        return "SQL_INJECTION_RULE";
    }

    @Override
    public String getName() {
        return "SQL Injection Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {

        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {

            String[] lines = content.split("\n");

            for (int i = 0; i < lines.length; i++) {

                if (SQL_PATTERN.matcher(lines[i]).find()) {

                    issues.add(
                            Issue.builder()
                                    .ruleCode(getRuleCode())
                                    .title("Potential SQL Injection")
                                    .description("SQL query appears to use string concatenation.")
                                    .severity(SeverityLevel.HIGH)
                                    .category(IssueCategory.SECURITY)
                                    .filePath(filePath)
                                    .lineNumber(i + 1)
                                    .recommendation("Use prepared statements or parameterized queries.")
                                    .build()
                    );
                }
            }
        });

        return issues;
    }
}