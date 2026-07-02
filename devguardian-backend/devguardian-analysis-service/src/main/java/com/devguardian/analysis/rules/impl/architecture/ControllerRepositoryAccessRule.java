package com.devguardian.analysis.rules.impl.architecture;

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
public class ControllerRepositoryAccessRule implements AnalysisRule {

    // Matches @Controller or @RestController annotations
    private static final Pattern CONTROLLER_ANNOTATION_PATTERN = Pattern.compile(
            "@(RestController|Controller)\\b"
    );

    // Matches repository field declarations (e.g., private UserRepository userRepository; or private final UserRepository repo;)
    private static final Pattern REPOSITORY_FIELD_PATTERN = Pattern.compile(
            "\\b(?:private|protected|public)?\\s*(?:final)?\\s*(\\w+Repository)\\b\\s+\\w+\\s*(?:=|;)"
    );

    @Override
    public String getRuleCode() {
        return "CONTROLLER_REPOSITORY_ACCESS_RULE";
    }

    @Override
    public String getName() {
        return "Controller Direct Repository Access Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            if (!filePath.endsWith(".java") || filePath.contains("/test/")) {
                return; // Only analyze source Java controllers
            }

            // 1. Verify if this file is a Controller
            if (!CONTROLLER_ANNOTATION_PATTERN.matcher(content).find()) {
                return;
            }

            // 2. Scan for direct Repository injections
            String[] lines = content.split("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();

                // Skip comments
                if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
                    continue;
                }

                Matcher matcher = REPOSITORY_FIELD_PATTERN.matcher(line);
                if (matcher.find()) {
                    String repositoryType = matcher.group(1);

                    issues.add(Issue.builder()
                            .ruleCode(getRuleCode())
                            .title("Direct Repository Reference in Controller")
                            .description("Controller injects '" + repositoryType + "' directly. Accessing repositories directly from controllers bypasses the service tier, violating clean 3-tier layering architectural principles.")
                            .severity(SeverityLevel.MEDIUM)
                            .category(IssueCategory.CODE_QUALITY)
                            .filePath(filePath)
                            .lineNumber(i + 1)
                            .recommendation("Inject a Service layer class instead (e.g., UserService) and encapsulate DB logic/repository operations within that Service.")
                            .build());
                }
            }
        });

        return issues;
    }
}
