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
public class EmptyCatchBlockRule implements AnalysisRule {

    private static final Pattern EMPTY_CATCH_PATTERN =
            Pattern.compile("catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}");

    @Override
    public String getRuleCode() {
        return "EMPTY_CATCH_BLOCK_RULE";
    }

    @Override
    public String getName() {
        return "Empty Catch Block Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {

        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {

            String[] lines = content.split("\n");

            for (int i = 0; i < lines.length; i++) {

                if (EMPTY_CATCH_PATTERN.matcher(lines[i]).find()) {

                    issues.add(
                            Issue.builder()
                                    .ruleCode(getRuleCode())
                                    .title("Empty Catch Block")
                                    .description("Exception is being silently ignored.")
                                    .severity(SeverityLevel.MEDIUM)
                                    .category(IssueCategory.CODE_QUALITY)
                                    .filePath(filePath)
                                    .lineNumber(i + 1)
                                    .recommendation("Log, rethrow, or properly handle the exception.")
                                    .build()
                    );
                }
            }
        });

        return issues;
    }
}