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
 * Detects usage of broken or deprecated cryptographic algorithms (MD5, SHA-1, DES, RC4).
 */
@Component
public class WeakCryptographyRule extends AbstractLineScanRule {

    private static final Pattern WEAK_CRYPTO = Pattern.compile(
            "(?i)\\b(?:crypto\\.createHash|crypto\\.createCipher|MessageDigest\\.getInstance|Cipher\\.getInstance)\\s*\\(\\s*[\"'](md5|sha1|sha-1|des|rc4)[\"']"
                    + "|\\b(?:createHash|createCipher)\\s*\\(\\s*[\"'](md5|sha1|sha-1|des|rc4)[\"']"
    );

    @Override
    public String getRuleCode() {
        return "WEAK_CRYPTO_RULE";
    }

    @Override
    public String getName() {
        return "Weak Cryptographic Algorithm Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isSourceCode(normalizedPath);
    }

    @Override
    protected void checkLine(String filePath, String code, int lineNumber, List<Issue> issues) {
        var matcher = WEAK_CRYPTO.matcher(code);
        if (matcher.find()) {
            String algo = matcher.group(1) != null ? matcher.group(1).toUpperCase() : "MD5/SHA1";
            issues.add(Issue.builder()
                    .ruleCode(getRuleCode())
                    .title("Weak Cryptographic Hash / Cipher: " + algo)
                    .description("The cryptographic algorithm " + algo + " is known to have practical collision or preimage vulnerabilities and is cryptographically broken for security operations.")
                    .severity(SeverityLevel.MEDIUM)
                    .category(IssueCategory.SECURITY)
                    .filePath(filePath)
                    .lineNumber(lineNumber)
                    .recommendation("Upgrade to SHA-256 / SHA-512, bcrypt / argon2 for password hashing, or AES-GCM for symmetric encryption.")
                    .build());
        }
    }
}
