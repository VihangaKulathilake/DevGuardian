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
 * Detects dangerous DOM sinks and unescaped HTML injections (XSS).
 */
@Component
public class CrossSiteScriptingRule extends AbstractLineScanRule {

    private static final Pattern DANGEROUS_HTML_SINK = Pattern.compile(
            "(?i)\\b(?:innerHTML|outerHTML|document\\.write|document\\.writeln)\\s*=\\s*.*(?:req\\.|location\\.|params|query|\\+|\\$\\{)"
                    + "|dangerouslySetInnerHTML\\s*=\\s*\\{\\s*\\{\\s*__html\\s*:"
                    + "|v-html\\s*="
                    + "|eval\\s*\\([^)]*(?:req\\.|req\\[|params|query|body|\\+|\\$\\{)[^)]*\\)"
    );

    @Override
    public String getRuleCode() {
        return "XSS_INJECTION_RULE";
    }

    @Override
    public String getName() {
        return "Cross-Site Scripting (XSS) Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isSourceCode(normalizedPath);
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        if (DANGEROUS_HTML_SINK.matcher(code).find()) {
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("Cross-Site Scripting (XSS) / Unsafe Sink")
                    .description("Unsafe HTML sink or dynamic execution evaluated with unescaped data. An attacker can inject malicious client-side JavaScript to hijack user sessions or steal credentials.")
                    .severity(SeverityLevel.HIGH)
                    .category(IssueCategory.SECURITY)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Use textContent or framework-managed text bindings (like {{ }} in Angular/Vue/React) instead of innerHTML, or sanitize content with DOMPurify.")
                    .build());
        }
    }
}
