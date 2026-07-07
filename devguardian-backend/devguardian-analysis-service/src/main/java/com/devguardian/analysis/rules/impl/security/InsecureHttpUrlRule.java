package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.support.AbstractLineScanRule;
import com.devguardian.analysis.rules.support.ScanFilters;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detects plaintext {@code http://} endpoints that real traffic will use.
 *
 * <p>False-positive fixes:</p>
 * <ul>
 *   <li>XML namespaces, XSD schema locations, DTD identifiers and W3C/OASIS
 *       standard URIs are identifiers, not network endpoints - lines
 *       containing {@code xmlns}, {@code schemaLocation}, {@code DOCTYPE},
 *       and the well-known standards hosts are skipped.</li>
 *   <li>Loopback, RFC 1918 private ranges, {@code *.local},
 *       {@code *.internal}, {@code *.svc}, {@code *.cluster.local} and
 *       docker-compose style single-label hosts are skipped - plain HTTP
 *       inside a private network segment is routine.</li>
 *   <li>Reserved documentation domains ({@code example.com/.org/.net},
 *       {@code *.test}, {@code *.invalid}, {@code *.example}) are skipped.</li>
 *   <li>Comments and documentation files are skipped by the base class,
 *       eliminating badge/license/link noise from READMEs and headers.</li>
 *   <li>Each unique URL is reported once per file, not once per occurrence.</li>
 * </ul>
 */
@Component
public class InsecureHttpUrlRule extends AbstractLineScanRule {

    private static final Pattern HTTP_URL_PATTERN = Pattern.compile(
            "\\bhttp://([A-Za-z0-9.\\-]+)(:\\d+)?(/[^\\s\"'<>)\\]}]*)?",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern XML_IDENTIFIER_CONTEXT = Pattern.compile(
            "(?i)xmlns|schemaLocation|noNamespaceSchemaLocation|DOCTYPE|xsi:|<!ENTITY|namespace");

    private static final Pattern IGNORED_HOST = Pattern.compile(
            "(?i)^(?:"
                    + "localhost|127(?:\\.\\d{1,3}){3}|0\\.0\\.0\\.0|\\[?::1]?"
                    + "|10(?:\\.\\d{1,3}){3}"
                    + "|192\\.168(?:\\.\\d{1,3}){2}"
                    + "|172\\.(?:1[6-9]|2\\d|3[01])(?:\\.\\d{1,3}){2}"
                    + "|169\\.254(?:\\.\\d{1,3}){2}"                    // link-local / metadata
                    + "|[\\w\\-]+"                                       // single-label host (docker service)
                    + "|.*\\.(?:local|localhost|internal|intranet|lan|corp|home|test|invalid|example)"
                    + "|.*\\.svc(?:\\.cluster\\.local)?"
                    + "|example\\.(?:com|org|net)|.*\\.example\\.(?:com|org|net)"
                    + ")$");

    /** Hosts that appear as protocol identifiers / standards, not endpoints. */
    private static final Pattern STANDARDS_HOST = Pattern.compile(
            "(?i)^(?:www\\.)?(?:w3\\.org|xmlsoap\\.org|xml\\.org|purl\\.org|openoffice\\.org"
                    + "|java\\.sun\\.com|jcp\\.org|maven\\.apache\\.org|ant\\.apache\\.org"
                    + "|checkstyle\\.org|puppycrawl\\.com|schemas\\.[\\w.\\-]+|ns\\.[\\w.\\-]+"
                    + "|schema\\.org|json-schema\\.org|springframework\\.org"
                    + "|www\\.springframework\\.org|springdoc\\.org|docbook\\.org"
                    + "|apache\\.org|www\\.apache\\.org|opensource\\.org|creativecommons\\.org"
                    + "|www\\.gnu\\.org|gnu\\.org|sonarsource\\.com|checkerframework\\.org)$");

    @Override
    public String getRuleCode() {
        return "INSECURE_HTTP_URL_RULE";
    }

    @Override
    public String getName() {
        return "Insecure HTTP URL Detection";
    }

    @Override
    protected boolean appliesTo(String normalizedPath) {
        return ScanFilters.isJavaSource(normalizedPath)
                || ScanFilters.isConfigFile(normalizedPath)
                || ScanFilters.hasExtension(normalizedPath, ".js", ".jsx", ".ts", ".tsx",
                        ".py", ".rb", ".go", ".sh", ".gradle", ".kts");
    }

    @Override
    protected void scanFile(String filePath, String content, List<Issue> issues) {
        Set<String> reportedUrls = new HashSet<>();
        String[] lines = content.split("\n", -1);
        var tracker = com.devguardian.analysis.rules.support.CommentTracker.forFile(filePath);

        for (int i = 0; i < lines.length; i++) {
            String code = tracker.stripComments(lines[i]);
            if (code.isBlank() || XML_IDENTIFIER_CONTEXT.matcher(code).find()) {
                continue;
            }
            Matcher matcher = HTTP_URL_PATTERN.matcher(code);
            while (matcher.find()) {
                String host = matcher.group(1);
                String url = matcher.group(0);

                if (IGNORED_HOST.matcher(host).matches()
                        || STANDARDS_HOST.matcher(host).matches()
                        || !reportedUrls.add(url)) {
                    continue;
                }

                issues.add(Issue.builder()
                        .ruleCode(getRuleCode())
                        .title("Insecure HTTP Communication")
                        .description("The endpoint '" + url + "' uses plaintext HTTP to a "
                                + "public host. Traffic to it can be read or modified in "
                                + "transit (credentials, tokens, payloads).")
                        .severity(SeverityLevel.MEDIUM)
                        .category(IssueCategory.SECURITY)
                        .filePath(filePath)
                        .lineNumber(i + 1)
                        .recommendation("Switch the URL to https:// and verify the certificate "
                                + "chain. If the service genuinely has no TLS endpoint, place "
                                + "it behind a TLS-terminating proxy.")
                        .build());
            }
        }
    }
}
