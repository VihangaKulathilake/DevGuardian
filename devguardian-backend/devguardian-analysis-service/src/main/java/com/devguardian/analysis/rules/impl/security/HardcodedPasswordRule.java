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
 * Detects real hardcoded passwords in Java sources and configuration files.
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>UI/message/validation variables ({@code passwordErrorMessage},
 *       {@code passwordPattern}, {@code passwordHint}...) are excluded by
 *       variable-name semantics.</li>
 *   <li>Placeholders ({@code changeme}, {@code <your-password>}, {@code ****}),
 *       property references ({@code ${DB_PASSWORD}}), env lookups and values
 *       that merely echo the key name are excluded.</li>
 *   <li>Structural config keys that are not credentials
 *       ({@code password-parameter}, {@code password.policy...},
 *       {@code passwordField}) are excluded.</li>
 *   <li>Comments (including block comments) never fire; test fixtures are
 *       skipped entirely.</li>
 *   <li>Values in Java that are regexes, format strings or i18n keys
 *       ({@code my.app.password.invalid}) are excluded.</li>
 * </ul>
 */
@Component
public class HardcodedPasswordRule extends AbstractLineScanRule {

    /** Code: identifier containing password/passwd/pwd assigned a string literal. */
    private static final Pattern CODE_ASSIGNMENT = Pattern.compile(
            "(?i)\\b([\\w$]*(?:password|passwd|pwd)[\\w$]*)\\s*[:=]\\s*[\"']([^\"']*)[\"']");

    /** Code: comparison against a literal, e.g. password.equals("s3cret") or password === 's3cret'. */
    private static final Pattern CODE_COMPARISON = Pattern.compile(
            "(?i)\\b([\\w$]*(?:password|passwd|pwd)[\\w$]*)\\s*(?:\\.\\s*(?:equals|equalsIgnoreCase|contentEquals)\\s*\\(\\s*[\"']([^\"']+)[\"']\\s*\\)|===?\\s*[\"']([^\"']+)[\"'])");

    /** Properties/YAML: key containing password assigned a value. */
    private static final Pattern CONFIG_ASSIGNMENT = Pattern.compile(
            "(?i)^\\s*([\\w.\\-]*(?:password|passwd|pwd)[\\w.\\-]*)\\s*[:=]\\s*(.+?)\\s*$");

    /**
     * Variable/key name fragments that indicate the value is NOT a credential:
     * UI text, validation artefacts, field/parameter names, policies, encoders.
     */
    private static final Pattern NON_CREDENTIAL_NAME = Pattern.compile(
            "(?i)message|msg|error|err|hint|label|tooltip|placeholder|description|desc"
                    + "|text|title|subject|format|regex|pattern|template|prompt|invalid"
                    + "|success|failure|validation|display|header|warn|fail|length"
                    + "|policy|rule|requirement|strength|encoder|hasher|hash|digest"
                    + "|field|param|parameter|attr|attribute|column|input|form"
                    + "|reset|forgot|change|confirm|repeat|retype|mismatch|history"
                    + "|expir|min|max|url|uri|path|endpoint|page|view|screen|enabled|required");

    /** Values that are clearly not passwords (class refs, i18n keys, regexes). */
    private static final Pattern NON_CREDENTIAL_VALUE = Pattern.compile(
            "^(?:[a-z][\\w]*(?:\\.[a-z][\\w]*){2,}"   // i18n / property key: a.b.c
                    + "|\\^.*\\$"                       // anchored regex
                    + "|.*%[sd].*"                      // format string
                    + "|\\{\\d+}.*"                     // MessageFormat
                    + "|classpath:.*|file:.*|https?://.*)$");

    @Override
    public String getRuleCode() {
        return "HARDCODED_PASSWORD_RULE";
    }

    @Override
    public String getName() {
        return "Hardcoded Password Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isSourceCode(normalizedPath) || ScanFilters.isConfigFile(normalizedPath);
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        if (ScanFilters.isSourceCode(filePath)) {
            Matcher assignment = CODE_ASSIGNMENT.matcher(code);
            if (assignment.find()
                    && report(filePath, lineNumber, assignment.group(1), assignment.group(2),
                              false, issues)) {
                return;
            }
            Matcher comparison = CODE_COMPARISON.matcher(code);
            if (comparison.find()) {
                String val = comparison.group(2) != null ? comparison.group(2) : comparison.group(3);
                report(filePath, lineNumber, comparison.group(1), val, true, issues);
            }
        } else {
            Matcher config = CONFIG_ASSIGNMENT.matcher(code);
            if (config.find()) {
                String value = unquote(config.group(2));
                report(filePath, lineNumber, config.group(1), value, false, issues);
            }
        }
    }

    private boolean report(String filePath, int lineNumber, String key, String value,
                           boolean comparison, List<Issue> issues) {
        String trimmedValue = value.trim();

        if (NON_CREDENTIAL_NAME.matcher(key).find()) {
            return false;
        }
        if (trimmedValue.length() < 4 || trimmedValue.contains(" ")) {
            return false; // sentences and trivial values
        }
        if (ScanFilters.isVariableReference(trimmedValue)
                || ScanFilters.isPlaceholderValue(trimmedValue)
                || ScanFilters.valueEchoesKey(key, trimmedValue)
                || NON_CREDENTIAL_VALUE.matcher(trimmedValue).matches()) {
            return false;
        }

        String context = comparison
                ? "compared against the '" + key + "' variable"
                : "assigned to '" + key + "'";

        issues.add(Issue.builder()
                .ruleCode(getRuleCode())
                .title("Hardcoded Password Detected")
                .description("A literal password (" + ScanFilters.mask(trimmedValue) + ") is "
                        + context + ". Credentials committed to source control are permanently "
                        + "recoverable from repository history and are a frequent breach entry point.")
                .severity(SeverityLevel.HIGH)
                .category(IssueCategory.SECRET_MANAGEMENT)
                .filePath(filePath)
                .lineNumber(lineNumber)
                .recommendation("Remove the literal and load the password from an environment "
                        + "variable, a secrets manager (Vault, AWS Secrets Manager, ...) or an "
                        + "externalized encrypted configuration. Rotate the exposed credential.")
                .build());
        return true;
    }

    private String unquote(String value) {
        String v = value.trim();
        if (v.length() >= 2
                && ((v.startsWith("\"") && v.endsWith("\""))
                    || (v.startsWith("'") && v.endsWith("'")))) {
            return v.substring(1, v.length() - 1);
        }
        return v;
    }
}
