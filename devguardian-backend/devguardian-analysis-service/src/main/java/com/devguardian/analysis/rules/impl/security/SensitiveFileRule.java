package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Detects credential-bearing files committed to the repository.
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>Matches on exact <b>basenames</b>, not substrings: previously
 *       {@code environment.env.d.ts}, {@code david_rsampler.py} or
 *       {@code credentials.json.md} could fire.</li>
 *   <li>Template variants ({@code .env.example}, {@code .env.sample},
 *       {@code .env.template}, {@code .env.dist}, {@code .env.test}) are
 *       explicitly excluded - committing those is the recommended practice.</li>
 *   <li>Public halves of keypairs ({@code id_rsa.pub}, {@code *.pub}) and
 *       certificate-only {@code .pem}/{@code .crt} files are not secrets:
 *       key files are confirmed by content ({@code PRIVATE KEY} marker)
 *       when content is available, and severity reflects what was found.</li>
 *   <li>{@code .env} files consisting solely of comments/blank lines or
 *       variable references are downgraded rather than flagged CRITICAL.</li>
 * </ul>
 */
@Component
public class SensitiveFileRule implements AnalysisRule {

    private static final Pattern ENV_FILE = Pattern.compile(
            "^\\.env(?:\\.[\\w\\-]+)?$", Pattern.CASE_INSENSITIVE);

    private static final Pattern ENV_TEMPLATE = Pattern.compile(
            "^\\.env\\.(?:example|sample|template|dist|defaults?|test(?:ing)?|ci)$",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern SSH_PRIVATE_KEY_FILE = Pattern.compile(
            "^id_(?:rsa|dsa|ecdsa|ed25519)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern KEY_MATERIAL_EXTENSION = Pattern.compile(
            ".*\\.(?:pem|key|p12|pfx|jks|keystore|ppk|asc)$", Pattern.CASE_INSENSITIVE);

    private static final Pattern CREDENTIAL_FILE = Pattern.compile(
            "^(?:credentials\\.json|service[-_]account(?:[-_][\\w\\-]+)?\\.json"
                    + "|client[-_]secret(?:[-_][\\w\\-]+)?\\.json"
                    + "|\\.netrc|\\.npmrc|\\.pypirc|\\.htpasswd|\\.boto"
                    + "|credentials|\\.git-credentials)$",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern PRIVATE_KEY_MARKER = Pattern.compile(
            "-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----");

    private static final Pattern ENV_REAL_VALUE = Pattern.compile(
            "(?m)^\\s*[A-Za-z_][A-Za-z0-9_]*\\s*=\\s*[^\\s#$][^\\n]*$");

    @Override
    public String getRuleCode() {
        return "SENSITIVE_FILE_RULE";
    }

    @Override
    public String getName() {
        return "Sensitive File Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();
        if (context == null || context.getFiles() == null) {
            return issues;
        }
        context.getFiles().forEach((rawPath, content) -> {
            if (rawPath == null) {
                return;
            }
            String path = ScanFilters.normalizePath(rawPath);
            if (ScanFilters.isExcludedPath(path) || ScanFilters.isTestPath(path)) {
                return;
            }
            String name = ScanFilters.fileName(path).toLowerCase(Locale.ROOT);

            if (ENV_TEMPLATE.matcher(name).matches() || name.endsWith(".pub")) {
                return; // documented-safe artifacts
            }

            if (ENV_FILE.matcher(name).matches()) {
                boolean hasRealValues = content != null && ENV_REAL_VALUE.matcher(content).find();
                issues.add(issue(path,
                        hasRealValues ? SeverityLevel.CRITICAL : SeverityLevel.MEDIUM,
                        "A dotenv file ('" + name + "') is committed to the repository"
                                + (hasRealValues
                                        ? " and contains concrete values. Every secret in it is "
                                          + "exposed to anyone with repository access."
                                        : ". Even without values today, committed .env files "
                                          + "tend to accumulate real secrets over time."),
                        "Remove the file from version control (git rm --cached), add it to "
                                + ".gitignore, and commit a sanitized .env.example instead. "
                                + "Rotate any secrets it contained."));
                return;
            }

            if (SSH_PRIVATE_KEY_FILE.matcher(name).matches()) {
                issues.add(issue(path, SeverityLevel.CRITICAL,
                        "An SSH private key file ('" + name + "') is committed. Anyone with "
                                + "repository access can authenticate as its owner.",
                        "Remove the key from the repository and its history, revoke it on all "
                                + "servers (authorized_keys) and services, and generate a new "
                                + "keypair."));
                return;
            }

            if (KEY_MATERIAL_EXTENSION.matcher(name).matches()) {
                boolean confirmedPrivate = content != null
                        && PRIVATE_KEY_MARKER.matcher(content).find();
                if (!confirmedPrivate && content != null && !content.isBlank()) {
                    // Content available and it is not a private key (likely a
                    // public certificate or truststore reference): do not flag.
                    if (name.endsWith(".pem") || name.endsWith(".asc")) {
                        return;
                    }
                }
                issues.add(issue(path,
                        confirmedPrivate ? SeverityLevel.CRITICAL : SeverityLevel.HIGH,
                        confirmedPrivate
                                ? "The file '" + name + "' contains PRIVATE KEY material "
                                  + "committed to source control."
                                : "The file '" + name + "' has a key-material extension and may "
                                  + "contain private keys or keystores.",
                        "Store key material in a secrets manager or deployment-time secure "
                                + "storage, never in the repository. If a private key was "
                                + "committed, revoke and reissue it."));
                return;
            }

            if (CREDENTIAL_FILE.matcher(name).matches()) {
                issues.add(issue(path, SeverityLevel.CRITICAL,
                        "A credential file ('" + name + "') is committed to the repository. "
                                + "Files of this name conventionally hold live authentication "
                                + "material (cloud service accounts, registry tokens, "
                                + "passwords).",
                        "Remove the file from version control and history, rotate the "
                                + "credentials it holds, and inject them at runtime via "
                                + "environment variables or a secrets manager."));
            }
        });
        return issues;
    }

    private Issue issue(String path, SeverityLevel severity, String description,
                        String recommendation) {
        return Issue.builder()
                .ruleCode(getRuleCode())
                .title("Sensitive File Found")
                .description(description)
                .severity(severity)
                .category(IssueCategory.SECRET_MANAGEMENT)
                .filePath(path)
                .recommendation(recommendation)
                .build();
    }
}
