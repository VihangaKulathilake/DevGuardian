package com.devguardian.analysis.rules.impl.security;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class InsecureHttpUrlRule implements AnalysisRule {

    private static final Pattern HTTP_URL_PATTERN = Pattern.compile(
            "\\bhttp://([a-zA-Z0-9][-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
            Pattern.CASE_INSENSITIVE
    );

    // List of domains/paths to ignore (localhost, test domains, schema URLs, maven/w3c standards)
    private static final Pattern IGNORE_PATTERN = Pattern.compile(
            "(localhost|127\\.0\\.0\\.1|10\\..*|192\\.168\\..*|.*\\.local|w3\\.org|schemas\\..*|maven\\.apache\\.org|xmlsoap\\.org|springdoc\\.org)",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public String getRuleCode() {
        return "INSECURE_HTTP_URL_RULE";
    }

    @Override
    public String getName() {
        return "Insecure HTTP URL Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            String[] lines = content.split("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];

                Matcher matcher = HTTP_URL_PATTERN.matcher(line);
                while (matcher.find()) {
                    String fullUrl = matcher.group(0);
                    String hostAndPath = matcher.group(1);

                    // Skip standard namespaces, maven repos, local hosts
                    if (IGNORE_PATTERN.matcher(hostAndPath).find()) {
                        continue;
                    }

                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("Insecure HTTP Communication")
                            .description("An unencrypted HTTP URL ('" + fullUrl + "') was detected. Data transmitted over HTTP is sent in plaintext and vulnerable to interception or tampering.")
                            .severity(SeverityLevel.MEDIUM)
                            .category(IssueCategory.SECURITY)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Update the URL to use HTTPS (secure communication protocol) to encrypt the transport channel.")
                            .build());
                }
            }
        });

        return issues;
    }
}
