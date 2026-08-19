package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detects OS command execution with dynamically concatenated input.
 */
@Component
public class CommandInjectionRule extends AbstractLineScanRule {

    private static final Pattern COMMAND_EXECUTION = Pattern.compile(
            "(?i)\\b(?:exec|execSync|spawn|spawnSync|fork|popen|system|Runtime\\.getRuntime\\(\\)\\.exec|ProcessBuilder)\\s*\\("
    );

    private static final Pattern DYNAMIC_CONCAT = Pattern.compile(
            "(?i)\\b(?:exec|execSync|spawn|system|Runtime\\.getRuntime\\(\\)\\.exec)\\s*\\([^)]*(?:\\+|\\$\\{|%s|concat|format)[^)]*\\)"
    );

    @Override
    public String getRuleCode() {
        return "COMMAND_INJECTION_RULE";
    }

    @Override
    public String getName() {
        return "Command Injection Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isSourceCode(normalizedPath);
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        if (COMMAND_EXECUTION.matcher(code).find() && DYNAMIC_CONCAT.matcher(code).find()) {
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("Potential Command Injection")
                    .description("System command executed using dynamic string concatenation or template interpolation. If any part of the command string is user-controllable, an attacker can execute arbitrary system commands.")
                    .severity(SeverityLevel.CRITICAL)
                    .category(IssueCategory.SECURITY)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Pass arguments as a safe array of strings rather than a concatenated shell string (e.g. execFile, spawn with argument arrays, or ProcessBuilder in Java).")
                    .build());
        }
    }
}
