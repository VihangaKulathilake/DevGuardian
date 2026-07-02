package com.devguardian.analysis.rules.impl.quality;

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
public class TodoCommentRule implements AnalysisRule {

    private static final Pattern TODO_PATTERN =
            Pattern.compile("(TODO|FIXME)", Pattern.CASE_INSENSITIVE);

    @Override
    public String getRuleCode() {
        return "TODO_COMMENT_RULE";
    }

    @Override
    public String getName() {
        return "TODO Comment Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {

        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {

            String[] lines = content.split("\n");

            for (int i = 0; i < lines.length; i++) {

                if (TODO_PATTERN.matcher(lines[i]).find()) {

                    issues.add(
                            Issue.builder()
                                    .ruleCode(getRuleCode())
                                    .title("TODO/FIXME Found")
                                    .description("Repository contains unfinished work markers.")
                                    .severity(SeverityLevel.LOW)
                                    .category(IssueCategory.CODE_QUALITY)
                                    .filePath(filePath)
                                    .lineNumber(i + 1)
                                    .recommendation("Review and resolve TODO/FIXME comments.")
                                    .build()
                    );
                }
            }
        });

        return issues;
    }
}
