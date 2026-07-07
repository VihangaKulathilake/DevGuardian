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
 * Detects debug mode enabled in configuration that will ship to production.
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>Only configuration files are scanned - {@code debug = true} in a Java
 *       local variable, a README code sample or a JS options object is not a
 *       deployment risk in itself and previously produced most of the noise.</li>
 *   <li>Profile-aware: files that are explicitly non-production
 *       ({@code application-dev.yml}, {@code application-local.properties},
 *       {@code *-test.yaml}, docker-compose override files) are skipped, and
 *       lines under an obvious dev-profile key are tolerated.</li>
 *   <li>Keys where "debug" means something else ({@code debugPort},
 *       {@code debug.symbols}, sourcemap options) are excluded; only a
 *       standalone debug flag fires.</li>
 *   <li>Comments never fire (handled by the comment-aware base class).</li>
 * </ul>
 */
@Component
public class DebugModeRule extends AbstractLineScanRule {

    /** Standalone debug flag key set to true. */
    private static final Pattern DEBUG_FLAG_PATTERN = Pattern.compile(
            "(?i)^\\s*(?:[\\w.\\-]*\\.)?(debug|debug[_\\-]?mode|app\\.debug|spring\\.debug)"
                    + "\\s*[:=]\\s*[\"']?true[\"']?\\s*$");

    /** Config files that are explicitly not production profiles. */
    private static final Pattern NON_PRODUCTION_CONFIG = Pattern.compile(
            "(?i)(?:^|/)[\\w.\\-]*(?:-|_|\\.)(?:dev|development|local|test|testing|sandbox|e2e)"
                    + "(?:\\.[\\w.\\-]+)?\\.(?:properties|ya?ml|env|conf|json|toml)$"
                    + "|(?:^|/)docker-compose\\.override\\.ya?ml$"
                    + "|(?:^|/)\\.env\\.(?:dev|development|local|test|example|sample)$");

    @Override
    public String getRuleCode() {
        return "DEBUG_MODE_RULE";
    }

    @Override
    public String getName() {
        return "Debug Mode Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isConfigFile(normalizedPath)
                && !NON_PRODUCTION_CONFIG.matcher(normalizedPath).find();
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        Matcher matcher = DEBUG_FLAG_PATTERN.matcher(code);
        if (!matcher.find()) {
            return;
        }
        issues.add(Issue.builder()
                .ruleCode(getRuleCode())
                .title("Debug Mode Enabled")
                .description("The configuration key '" + matcher.group(1) + "' enables debug "
                        + "mode. In production, debug mode leaks stack traces, internal paths, "
                        + "request details and (in some frameworks) interactive debuggers to "
                        + "end users.")
                .severity(SeverityLevel.MEDIUM)
                .category(IssueCategory.CONFIGURATION)
                .filePath(filePath)
                .lineNumber(lineNumber)
                .recommendation("Set debug to false in the default/production profile and "
                        + "enable it only in a dev-specific profile file (e.g. "
                        + "application-dev.yml) or via an environment variable.")
                .build());
    }
}
