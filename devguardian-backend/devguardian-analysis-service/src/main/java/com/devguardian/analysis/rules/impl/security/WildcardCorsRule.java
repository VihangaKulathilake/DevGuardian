package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.CommentTracker;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Detects CORS configurations that allow any origin.
 *
 * <p>Improvements:</p>
 * <ul>
 *   <li>Comment-aware and test-aware: commented-out samples and MockMvc test
 *       configuration no longer fire.</li>
 *   <li>Covers the shapes the old single-line regex missed: bare
 *       {@code @CrossOrigin} (wildcard by default in Spring),
 *       {@code origins = {"*"}} array syntax, collection variants
 *       ({@code List.of("*")}, {@code Arrays.asList("*")},
 *       {@code Collections.singletonList("*")}),
 *       {@code addAllowedOrigin("*")}/{@code addAllowedOriginPattern("*")},
 *       header-based {@code Access-Control-Allow-Origin: *} and YAML/properties
 *       {@code allowed-origins: "*"} configuration.</li>
 *   <li>Escalates to HIGH when the same file also allows credentials -
 *       wildcard + credentials is the dangerous combination browsers only
 *       partially defend against (and origin-reflection patterns bypass).</li>
 *   <li>Wildcards inside string constants that are not CORS calls (glob
 *       patterns, SQL {@code SELECT *}) never fire because matching is
 *       anchored to CORS API shapes.</li>
 * </ul>
 */
@Component
public class WildcardCorsRule extends AbstractLineScanRule {

    private static final Pattern CODE_WILDCARD_CORS = Pattern.compile(
            "@CrossOrigin\\s*(?:\\(\\s*\\)|(?!\\s*\\())"                              // bare annotation
                    + "|@CrossOrigin\\s*\\(\\s*(?:origins\\s*=\\s*)?(?:\\{\\s*)?\"\\*\""  // origins = "*" / {"*"}
                    + "|\\.(?:allowedOrigins|allowedOriginPatterns)\\s*\\(\\s*\"\\*\"\\s*\\)"
                    + "|\\.(?:allowedOrigins|allowedOriginPatterns|setAllowedOrigins|setAllowedOriginPatterns)"
                    + "\\s*\\(\\s*(?:List\\.of|Arrays\\.asList|Collections\\.singletonList|Set\\.of)"
                    + "\\s*\\(\\s*\"\\*\"\\s*\\)\\s*\\)"
                    + "|\\.(?:addAllowedOrigin|addAllowedOriginPattern)\\s*\\(\\s*\"\\*\"\\s*\\)"
                    + "|(?:setHeader|addHeader|header)\\s*\\(\\s*[\"']Access-Control-Allow-Origin[\"']\\s*,\\s*[\"']\\*[\"']\\s*\\)"
                    + "|origin\\s*:\\s*[\"']\\*[\"']"
                    + "|cors\\s*\\(\\s*\\{\\s*origin\\s*:\\s*[\"']\\*[\"']");

    private static final Pattern CONFIG_WILDCARD_CORS = Pattern.compile(
            "(?i)^\\s*[\\w.\\-]*(?:allowed[.\\-]?origins?|cors[.\\-]?origins?|"
                    + "access-control-allow-origin)[\\w.\\-]*\\s*[:=]\\s*[\"']?\\*[\"']?\\s*$");

    private static final Pattern ALLOWS_CREDENTIALS = Pattern.compile(
            "(?i)allow[\\-_.]?credentials\\s*(?:[:=(]\\s*|\\(\\s*)(?:[\"']?true[\"']?|true)");

    @Override
    public String getRuleCode() {
        return "WILDCARD_CORS_RULE";
    }

    @Override
    public String getName() {
        return "Wildcard CORS Origin Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isSourceCode(normalizedPath) || ScanFilters.isConfigFile(normalizedPath);
    }

    @Override
    protected void scanFile(String filePath, String content, List<Issue> issues) {
        boolean sourceCode = ScanFilters.isSourceCode(filePath);
        boolean credentialed = ALLOWS_CREDENTIALS.matcher(content).find();

        String[] lines = content.split("\n", -1);
        CommentTracker tracker = CommentTracker.forFile(filePath);
        for (int i = 0; i < lines.length; i++) {
            String code = tracker.stripComments(lines[i]);
            if (code.isBlank()) {
                continue;
            }
            boolean matched = sourceCode
                    ? CODE_WILDCARD_CORS.matcher(code).find()
                    : CONFIG_WILDCARD_CORS.matcher(code).find();
            if (!matched) {
                continue;
            }
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("Wildcard CORS Origin Allowed")
                    .description("CORS is configured to accept requests from any origin ('*')"
                            + (credentialed
                                    ? " while credentials are also allowed. This combination "
                                      + "lets any website drive authenticated requests against "
                                      + "the API from a victim's browser."
                                    : ". Any website can read responses from this API in a "
                                      + "visitor's browser context."))
                    .severity(credentialed ? SeverityLevel.HIGH : SeverityLevel.MEDIUM)
                    .category(IssueCategory.SECURITY)
                    .filePath(filePath)
                    .lineNumber(i + 1)
                    .recommendation("Replace '*' with an explicit allow-list of trusted origins "
                            + "loaded from configuration (e.g. allowedOrigins(corsProperties"
                            + ".getOrigins())). Never combine wildcard or reflected origins "
                            + "with allowCredentials(true).")
                    .build());
        }
    }
}
