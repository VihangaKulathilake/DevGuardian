package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detects exposed AWS credentials.
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>AWS's own documented example credentials
 *       ({@code AKIAIOSFODNN7EXAMPLE}, {@code wJalrXUtnFEMI/...EXAMPLEKEY})
 *       and any key containing {@code EXAMPLE} are ignored - these appear in
 *       thousands of READMEs and SDK samples.</li>
 *   <li>Access-key IDs must not be a fragment of a longer token (guarded by
 *       stricter boundaries), eliminating matches inside base64 blobs and
 *       ARNs.</li>
 *   <li>Secret keys must be exactly 40 chars of the AWS alphabet <b>and</b>
 *       have generated-credential entropy; sentence-like or repeated values
 *       are ignored, as are {@code ${...}} references and placeholders.</li>
 *   <li>Key names like {@code aws.secret.key.property} or
 *       {@code secretKeyRef} (Kubernetes) no longer fire on non-values.</li>
 * </ul>
 */
@Component
public class AwsCredentialRule extends AbstractLineScanRule {

    private static final Pattern AWS_ACCESS_KEY_PATTERN = Pattern.compile(
            "(?<![A-Za-z0-9/+=])((?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16})(?![A-Za-z0-9/+=])");

    private static final Pattern AWS_SECRET_KEY_PATTERN = Pattern.compile(
            "(?i)\\b(?:aws[_\\-.]?)?secret[_\\-.]?(?:access[_\\-.]?)?key\\s*[:=]\\s*"
                    + "[\"']?([A-Za-z0-9/+=]{40})[\"']?(?![A-Za-z0-9/+=])");

    /** Credentials published by AWS in documentation - never real. */
    private static final Set<String> DOCUMENTED_EXAMPLES = Set.of(
            "AKIAIOSFODNN7EXAMPLE",
            "AKIAI44QH8DHBEXAMPLE",
            "ASIAIOSFODNN7EXAMPLE",
            "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            "je7MtGbClwBF/2Zp9Utk/h3yCo8nvbEXAMPLEKEY");

    @Override
    public String getRuleCode() {
        return "AWS_CREDENTIAL_RULE";
    }

    @Override
    public String getName() {
        return "AWS Credential Exposure Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return true; // AWS keys leak into any file type
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        Matcher accessMatcher = AWS_ACCESS_KEY_PATTERN.matcher(code);
        while (accessMatcher.find()) {
            String accessKey = accessMatcher.group(1);
            if (isExample(accessKey)) {
                continue;
            }
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("AWS Access Key Exposed")
                    .description("An AWS Access Key ID (" + ScanFilters.mask(accessKey)
                            + ") was found in the codebase. Together with its secret key it "
                            + "grants API access to your AWS account - exposed pairs are "
                            + "typically abused within minutes of a public commit.")
                    .severity(SeverityLevel.CRITICAL)
                    .category(IssueCategory.SECRET_MANAGEMENT)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Deactivate this access key in the IAM console immediately, "
                            + "rotate credentials, audit CloudTrail for unauthorized use, and "
                            + "switch to IAM roles / instance profiles or the default "
                            + "credential provider chain.")
                    .build());
            return; // one credential finding per line
        }

        Matcher secretMatcher = AWS_SECRET_KEY_PATTERN.matcher(code);
        if (secretMatcher.find()) {
            String secretKey = secretMatcher.group(1);
            if (isExample(secretKey)
                    || ScanFilters.isVariableReference(secretKey)
                    || ScanFilters.isPlaceholderValue(secretKey)
                    || !ScanFilters.looksLikeGeneratedToken(secretKey)) {
                return;
            }
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("AWS Secret Access Key Exposed")
                    .description("A value matching the exact shape of an AWS Secret Access Key "
                            + "(" + ScanFilters.mask(secretKey) + ") is hardcoded. Combined "
                            + "with an access key ID this allows full API access to your AWS "
                            + "infrastructure.")
                    .severity(SeverityLevel.CRITICAL)
                    .category(IssueCategory.SECRET_MANAGEMENT)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Rotate the credential pair in IAM now and remove it from "
                            + "git history (e.g. git filter-repo). Store AWS credentials only "
                            + "in the environment, ~/.aws/credentials outside the repo, or an "
                            + "IAM role.")
                    .build());
        }
    }

    private boolean isExample(String key) {
        return DOCUMENTED_EXAMPLES.contains(key)
                || key.toUpperCase().contains("EXAMPLE")
                || key.toUpperCase().contains("SAMPLE");
    }
}
