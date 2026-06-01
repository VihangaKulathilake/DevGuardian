package com.devguardian.analysis.rules.impl;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SensitiveFileRule implements AnalysisRule {

    @Override
    public String getRuleCode() {
        return "SENSITIVE_FILE_RULE";
    }

    @Override
    public String getName() {
        return "Sensitive File Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {

        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {

            if (filePath.endsWith(".env")
                    || filePath.contains("id_rsa")
                    || filePath.contains("credentials.json")
                    || filePath.contains(".pem")) {

                issues.add(
                        Issue.builder()
                                .ruleCode(getRuleCode())
                                .title("Sensitive File Found")
                                .description("Repository contains a potentially sensitive file.")
                                .severity(SeverityLevel.HIGH)
                                .category(IssueCategory.SECURITY)
                                .filePath(filePath)
                                .recommendation("Remove secrets from source control.")
                                .build()
                );
            }
        });

        return issues;
    }
}