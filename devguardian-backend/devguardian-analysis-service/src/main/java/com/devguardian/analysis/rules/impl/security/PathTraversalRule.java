package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Detects file system access and file serving with unvalidated dynamic path inputs.
 */
@Component
public class PathTraversalRule extends AbstractLineScanRule {

    private static final Pattern PATH_ACCESS_DYNAMIC = Pattern.compile(
            "(?i)\\b(?:sendFile|download|readFile|readFileSync|createReadStream|FileInputStream|FileReader|File\\s*\\()\\s*\\([^)]*(?:req\\.(?:query|params|body|param)|request\\.getParameter|\\+|\\$\\{)[^)]*\\)"
    );

    @Override
    public String getRuleCode() {
        return "PATH_TRAVERSAL_RULE";
    }

    @Override
    public String getName() {
        return "Path Traversal Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isSourceCode(normalizedPath);
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        if (PATH_ACCESS_DYNAMIC.matcher(code).find()) {
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("Potential Path Traversal")
                    .description("File operation or file download built using dynamic user parameters. An attacker could use '../' sequences to escape the intended directory and read sensitive host files.")
                    .severity(SeverityLevel.HIGH)
                    .category(IssueCategory.SECURITY)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Normalize paths using path.resolve() / Path.normalize() and verify that the target path starts with the allowed base directory before accessing the file system.")
                    .build());
        }
    }
}
