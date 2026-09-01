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
 * Detects generic hardcoded secrets and tokens (auth tokens, signing secrets,
 * OAuth client secrets, private keys) assigned to string literals.
 *
 * <p>Scope note: passwords are handled by {@link HardcodedPasswordRule} and
 * API keys / AWS credentials by their dedicated rules; this rule deliberately
 * excludes those keywords so a single line is never reported twice.</p>
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>Requires the value to actually look like a credential: minimum length
 *       of 8 <b>and</b> either mixed character classes or entropy typical of
 *       generated tokens. {@code tokenType = "Bearer"} or
 *       {@code secretQuestion = "pet"} no longer fire.</li>
 *   <li>Identifier semantics exclude token <i>metadata</i> ({@code tokenUrl},
 *       {@code tokenHeader}, {@code tokenExpiry}, {@code csrfTokenParam}...).</li>
 *   <li>Placeholders, variable references and echoed key names are excluded.</li>
 *   <li>Well-known non-secret constants (e.g. {@code "Bearer "},
 *       {@code "Authorization"}) are excluded.</li>
 * </ul>
 */
@Component
public class HardcodedSecretRule extends AbstractLineScanRule {

    private static final Pattern SECRET_ASSIGNMENT = Pattern.compile(
            "(?i)\\b([\\w$.\\-]*(?:secret|token|private[_\\-]?key|signing[_\\-]?key|"
                    + "access[_\\-]?key|auth[_\\-]?key|encryption[_\\-]?key)[\\w$.\\-]*)"
                    // Quotes are optional: .properties files use unquoted values while
                    // Java/JS/YAML files use quoted string literals. The lazy [^"'\r\n]+?
                    // stops at the end of the line (anchored by \s*$) in both cases.
                    + "\\s*[:=]\\s*[\"']?([^\"'\\r\\n]+?)[\"']?\\s*$");

    /** Names describing token plumbing rather than token values. */
    private static final Pattern NON_SECRET_NAME = Pattern.compile(
            "(?i)message|msg|error|err|hint|label|tooltip|placeholder|description|desc"
                    + "|text|title|subject|format|regex|pattern|template|prompt|invalid"
                    + "|success|failure|validation|display|header|warn|fail"
                    + "|url|uri|endpoint|path|param|parameter|field|attr|attribute"
                    + "|name|type|prefix|suffix|scheme|issuer|audience|claim|subject"
                    + "|expir|ttl|lifetime|timeout|duration|length|size|version"
                    + "|store|file|location|alias|provider|algorithm|enabled|required|missing");

    /** Common literal values around auth code that are not secrets. */
    private static final Pattern KNOWN_SAFE_VALUE = Pattern.compile(
            "(?i)^(?:bearer\\s*|basic\\s*|authorization|x-[\\w-]+|application/[\\w+.-]+"
                    + "|hs256|hs384|hs512|rs256|rs384|rs512|es256|aes|rsa|hmacsha\\d+"
                    + "|utf-?8|classpath:.*|file:.*|https?://.*)$");

    @Override
    public String getRuleCode() {
        return "HARDCODED_SECRET_RULE";
    }

    @Override
    public String getName() {
        return "Hardcoded Secret Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isJavaSource(normalizedPath)
                || ScanFilters.isConfigFile(normalizedPath)
                || ScanFilters.hasExtension(normalizedPath, ".js", ".jsx", ".ts", ".tsx", ".py", ".rb", ".go", ".sh");
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        Matcher matcher = SECRET_ASSIGNMENT.matcher(code);
        while (matcher.find()) {
            String key = matcher.group(1);
            String value = matcher.group(2).trim();

            if (NON_SECRET_NAME.matcher(key).find()) {
                continue;
            }
            if (value.length() < 8 || value.contains(" ")) {
                continue;
            }
            if (ScanFilters.isVariableReference(value)
                    || ScanFilters.isPlaceholderValue(value)
                    || ScanFilters.valueEchoesKey(key, value)
                    || KNOWN_SAFE_VALUE.matcher(value).matches()) {
                continue;
            }
            // Require credential-like shape: mixed classes or generated-token
            // entropy. Plain lowercase words ("development", "internal") pass
            // only when long AND high-entropy.
            boolean credentialShape = ScanFilters.characterClassCount(value) >= 2
                    || ScanFilters.looksLikeGeneratedToken(value);
            if (!credentialShape) {
                continue;
            }

            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("Hardcoded Secret Detected")
                    .description("The key '" + key + "' is assigned a literal secret ("
                            + ScanFilters.mask(value) + ") directly in source. Anyone with "
                            + "repository read access - or access to its history - can extract it.")
                    .severity(SeverityLevel.CRITICAL)
                    .category(IssueCategory.SECRET_MANAGEMENT)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Move the secret to an environment variable or a secrets "
                            + "manager and reference it (e.g. ${" + toEnvName(key) + "}). "
                            + "Rotate the exposed value, since git history retains it.")
                    .build());
            return; // one finding per line is enough
        }
    }

    private String toEnvName(String key) {
        return key.replaceAll("[^A-Za-z0-9]+", "_").toUpperCase();
    }
}
