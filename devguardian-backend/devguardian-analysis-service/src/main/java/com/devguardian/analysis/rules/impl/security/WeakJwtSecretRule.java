package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detects weak or hardcoded JWT signing secrets.
 *
 * <p>Findings are split into two distinct problems with accurate messaging:</p>
 * <ul>
 *   <li><b>Weak secret</b> - dictionary word, short, or low-entropy value
 *       (brute-forceable offline from any captured token).</li>
 *   <li><b>Weak default fallback</b> - {@code ${JWT_SECRET:dev}} style
 *       defaults that silently activate when the env var is missing.</li>
 * </ul>
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>Pure environment references ({@code ${JWT_SECRET}}) and placeholder
 *       values never fire.</li>
 *   <li>Keys that configure JWT plumbing rather than the secret itself
 *       ({@code jwt.secret.header}, {@code jwt-secret-name},
 *       {@code jwtSecretKeyAlias}) are excluded.</li>
 *   <li>Length is judged in addition to entropy: a 40-char string of
 *       {@code aaaa...} is still weak, while a 32+ char generated value with
 *       high entropy passes even if it contains a dictionary substring.</li>
 *   <li>Test sources and non-production profile files are skipped.</li>
 * </ul>
 */
@Component
public class WeakJwtSecretRule extends AbstractLineScanRule {

    private static final Pattern JWT_SECRET_PATTERN = Pattern.compile(
            "(?i)\\b(jwt[._\\-]?(?:signing[._\\-]?)?secret(?:[._\\-]?key)?|jwtSecret)"
                    + "([\\w.\\-]*)\\s*[:=]\\s*(\\S+)");

    /** Suffixes meaning the key configures something other than the value. */
    private static final Pattern PLUMBING_SUFFIX = Pattern.compile(
            "(?i)name|alias|header|param|file|path|location|ref|env|source|provider|missing|required");

    private static final Set<String> WEAK_DICTIONARY = Set.of(
            "test", "secret", "password", "123456", "12345678", "admin", "dev",
            "development", "jwtsecret", "jwt_secret", "mysecret", "my-secret",
            "secretkey", "secret_key", "signature", "token", "default", "demo",
            "changeme", "supersecret", "topsecret", "letmein", "qwerty");

    private static final int MINIMUM_LENGTH = 32; // 256 bits for HS256

    @Override
    public String getRuleCode() {
        return "WEAK_JWT_SECRET_RULE";
    }

    @Override
    public String getName() {
        return "Weak JWT Secret Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isJavaSource(normalizedPath) || ScanFilters.isConfigFile(normalizedPath);
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        Matcher matcher = JWT_SECRET_PATTERN.matcher(code);
        if (!matcher.find()) {
            return;
        }
        if (PLUMBING_SUFFIX.matcher(matcher.group(2)).find()) {
            return;
        }

        String rawValue = stripQuotes(matcher.group(3));
        boolean isDefaultFallback = false;

        if (rawValue.startsWith("${") && rawValue.endsWith("}")) {
            int colon = rawValue.indexOf(':');
            if (colon < 0) {
                return; // pure env reference - the safe pattern
            }
            rawValue = rawValue.substring(colon + 1, rawValue.length() - 1).trim();
            rawValue = stripQuotes(rawValue);
            isDefaultFallback = true;
            if (rawValue.isEmpty()) {
                return; // empty default fails fast at startup - acceptable
            }
        } else if (ScanFilters.isVariableReference(rawValue)) {
            return;
        }

        // Note: unlike the secret-exposure rules, placeholder-looking values
        // are NOT excluded here. If "changeme" or "aaaa..." ships as the JWT
        // secret, that IS the weak-secret vulnerability. Only unparseable
        // documentation templates like <your-secret> are skipped.
        if (rawValue.isEmpty() || (rawValue.startsWith("<") && rawValue.endsWith(">"))) {
            return;
        }

        boolean dictionaryWord = WEAK_DICTIONARY.contains(rawValue.toLowerCase(Locale.ROOT));
        boolean tooShort = rawValue.length() < MINIMUM_LENGTH;
        boolean lowEntropy = ScanFilters.shannonEntropy(rawValue) < 3.0
                || rawValue.chars().distinct().count() < 8;

        if (!dictionaryWord && !tooShort && !lowEntropy) {
            // Long, high-entropy literal: still hardcoded, but that is the
            // HardcodedSecretRule's finding, not a *weak* secret.
            return;
        }

        String weakness = dictionaryWord ? "a common dictionary value"
                : tooShort ? "shorter than 256 bits (" + rawValue.length() + " chars)"
                : "low-entropy (repetitive/predictable characters)";

        issues.add(Issue.builder()
                .ruleCode(getRuleCode())
                .title(isDefaultFallback ? "Weak JWT Secret Default Fallback" : "Weak JWT Secret Key")
                .description((isDefaultFallback
                        ? "The JWT secret falls back to " + weakness + " ("
                          + ScanFilters.mask(rawValue) + ") when the environment variable is "
                          + "unset. A misconfigured deployment would silently sign tokens with "
                          + "a guessable key."
                        : "The configured JWT signing secret is " + weakness + " ("
                          + ScanFilters.mask(rawValue) + "). An attacker who captures any "
                          + "token can brute-force the key offline and then forge tokens for "
                          + "any user."))
                .severity(SeverityLevel.HIGH)
                .category(IssueCategory.SECRET_MANAGEMENT)
                .filePath(filePath)
                .lineNumber(lineNumber)
                .recommendation("Generate a random secret of at least 32 bytes (e.g. "
                        + "'openssl rand -base64 48') and supply it via ${JWT_SECRET} with no "
                        + "default fallback, or switch to asymmetric signing (RS256/ES256).")
                .build());
    }

    private String stripQuotes(String value) {
        String v = value.trim();
        if (v.length() >= 2 && ((v.startsWith("\"") && v.endsWith("\""))
                || (v.startsWith("'") && v.endsWith("'")))) {
            return v.substring(1, v.length() - 1);
        }
        return v;
    }
}
