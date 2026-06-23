package com.devguardian.analysis.rules.impl.quality;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class LargeFileRule implements AnalysisRule {

    private static final long WARNING_THRESHOLD_BYTES = 500 * 1024; // 500 KB
    private static final long CRITICAL_THRESHOLD_BYTES = 1024 * 1024; // 1 MB

    @Override
    public String getRuleCode() {
        return "LARGE_FILE_RULE";
    }

    @Override
    public String getName() {
        return "Large File Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        if (context.getFileSizes() == null) {
            return issues;
        }

        context.getFileSizes().forEach((filePath, sizeInBytes) -> {
            // Exclude lock files or binary artifacts which are naturally large
            if (filePath.endsWith("package-lock.json") 
                    || filePath.endsWith("pnpm-lock.yaml") 
                    || filePath.endsWith("yarn.lock") 
                    || filePath.endsWith(".jar")
                    || filePath.endsWith(".war")
                    || filePath.contains("/.git/")
                    || filePath.contains("/target/")) {
                return;
            }

            if (sizeInBytes > WARNING_THRESHOLD_BYTES) {
                boolean isCriticalLarge = sizeInBytes > CRITICAL_THRESHOLD_BYTES;
                String sizeMb = String.format("%.2f MB", (double) sizeInBytes / (1024 * 1024));

                issues.add(Issue.builder()
                        .ruleCode(getRuleCode())
                        .title(isCriticalLarge ? "Critical Large File Found" : "Large File Found")
                        .description("File '" + filePath + "' has a size of " + sizeMb + ". Keeping large source or configuration files in repositories degrades JGit clone performance, scanner latency, and code readability.")
                        .severity(SeverityLevel.LOW) // Requirements specify LOW severity overall
                        .category(IssueCategory.CODE_QUALITY)
                        .filePath(filePath)
                        .recommendation(isCriticalLarge 
                                ? "This file exceeds 1MB. Strongly consider moving it to external storage, git-lfs, or excluding it using gitignore."
                                : "This file exceeds 500KB. Consider breaking it down or refactoring to keep repository size lean.")
                        .build());
            }
        });

        return issues;
    }
}
