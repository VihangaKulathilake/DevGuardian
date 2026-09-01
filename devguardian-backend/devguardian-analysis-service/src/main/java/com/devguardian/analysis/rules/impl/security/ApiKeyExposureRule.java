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
 * Detects hardcoded third-party API keys and client secrets.
 *
 * <p>Detection is two-pronged:</p>
 * <ol>
 *   <li><b>Vendor-format keys</b> - unambiguous prefixes such as
 *       {@code sk_live_}, {@code AIza}, {@code ghp_}, {@code xoxb-},
 *       {@code SG.} anywhere in code. These formats are self-identifying, so
 *       they fire with high confidence regardless of variable name.</li>
 *   <li><b>Named assignments</b> - {@code api_key = "..."} style. These only
 *       fire when the value passes entropy and character-class checks, killing
 *       matches like {@code apiKeyHeader = "X-Api-Key"} or
 *       {@code api_key = your_api_key_here}.</li>
 * </ol>
 *
 * <p>Test-mode vendor keys ({@code sk_test_...}) are reported at LOW severity
 * instead of CRITICAL, and documentation/test files are skipped.</p>
 */
@Component
public class ApiKeyExposureRule extends AbstractLineScanRule {

    /** Self-identifying vendor key formats (prefix proves it is a key). */
    private static final Pattern VENDOR_KEY_PATTERN = Pattern.compile(
            "\\b("
                    + "sk_live_[0-9a-zA-Z]{16,}"          // Stripe live secret
                    + "|rk_live_[0-9a-zA-Z]{16,}"          // Stripe restricted
                    + "|sk_test_[0-9a-zA-Z]{16,}"          // Stripe test secret
                    + "|AIza[0-9A-Za-z\\-_]{35}"           // Google API key
                    + "|gh[pousr]_[0-9A-Za-z]{36,}"        // GitHub tokens
                    + "|github_pat_[0-9A-Za-z_]{22,}"      // GitHub fine-grained PAT
                    + "|xox[baprs]-[0-9A-Za-z\\-]{10,}"    // Slack tokens
                    + "|SG\\.[0-9A-Za-z\\-_]{22}\\.[0-9A-Za-z\\-_]{43}" // SendGrid
                    + "|sk-[A-Za-z0-9\\-_]{20,}"           // OpenAI-style secret
                    + "|glpat-[0-9A-Za-z\\-_]{20,}"        // GitLab PAT
                    + "|npm_[0-9A-Za-z]{36}"               // npm token
                    + ")\\b");

    /** Named key assignment; value shape is verified separately. */
    private static final Pattern NAMED_KEY_ASSIGNMENT = Pattern.compile(
            "(?i)\\b([\\w.\\-]*(?:api[_\\-]?key|apikey|client[_\\-.]?secret|"
                    + "stripe[_\\-]?key|sendgrid[_\\-]?key|twilio[_\\-]?(?:key|sid))[\\w.\\-]*)"
                    + "\\s*[:=]\\s*[\"']?([A-Za-z0-9\\-_./+=]{16,})[\"']?");

    /** Key names describing plumbing, not values. */
    private static final Pattern NON_KEY_NAME = Pattern.compile(
            "(?i)header|param|parameter|name|field|label|prompt|placeholder|hint"
                    + "|message|error|url|uri|endpoint|path|file|location|id$|enabled|required|missing|invalid");

    @Override
    public String getRuleCode() {
        return "API_KEY_EXPOSURE_RULE";
    }

    @Override
    public String getName() {
        return "API Key Exposure Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        // Keys leak into every file type developers touch.
        return true;
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        Matcher vendor = VENDOR_KEY_PATTERN.matcher(code);
        if (vendor.find()) {
            String key = vendor.group(1);
            boolean testKey = key.startsWith("sk_test_");
            issues.add(buildIssue(filePath, lineNumber, key,
                    testKey ? SeverityLevel.LOW : SeverityLevel.CRITICAL,
                    testKey
                            ? "A vendor test-mode API key was found in source. Test keys cannot "
                              + "charge live accounts but still expose your test environment."
                            : "A live vendor API key (" + ScanFilters.mask(key) + ") was found in "
                              + "source. Its format is self-identifying, so exposure is unambiguous."));
            return;
        }

        Matcher named = NAMED_KEY_ASSIGNMENT.matcher(code);
        if (!named.find()) {
            return;
        }
        String keyName = named.group(1);
        String value = named.group(2).trim();

        if (NON_KEY_NAME.matcher(keyName).find()) {
            return;
        }
        if (ScanFilters.isVariableReference(value)
                || ScanFilters.isPlaceholderValue(value)
                || ScanFilters.valueEchoesKey(keyName, value)) {
            return;
        }
        // A real key is machine-generated: demand entropy/mixed classes so
        // that english-ish values ("my-companys-api-key-name") do not fire.
        if (!ScanFilters.looksLikeGeneratedToken(value)) {
            return;
        }
        // Constant references like API_KEY_PROPERTY assigned to another name.
        if (value.matches("[A-Z][A-Z0-9_]*") && ScanFilters.shannonEntropy(value) < 3.6) {
            return;
        }

        issues.add(buildIssue(filePath, lineNumber, value, SeverityLevel.CRITICAL,
                "The key '" + keyName + "' is assigned a high-entropy literal ("
                        + ScanFilters.mask(value) + ") that matches the shape of a generated "
                        + "API credential. Leaked keys allow third parties to use paid "
                        + "integrations on your account and access its data."));
    }

    private Issue buildIssue(String filePath, int lineNumber, String key,
                             SeverityLevel severity, String description) {
        return Issue.builder()
                .ruleCode(getRuleCode())
                .title("API Key Exposed")
                .description(description)
                .severity(severity)
                .category(IssueCategory.SECRET_MANAGEMENT)
                .filePath(filePath)
                .lineNumber(lineNumber)
                .recommendation("Revoke the credential in the vendor dashboard, purge it from "
                        + "git history, and load it at runtime from an environment variable or "
                        + "secrets manager instead.")
                .build();
    }
}
