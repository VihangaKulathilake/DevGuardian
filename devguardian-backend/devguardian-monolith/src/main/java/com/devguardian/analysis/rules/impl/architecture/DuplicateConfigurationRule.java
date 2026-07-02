package com.devguardian.analysis.rules.impl.architecture;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class DuplicateConfigurationRule implements AnalysisRule {

    // Matches property keys, ignoring comments and whitespaces. E.g., spring.datasource.url = ...
    private static final Pattern PROPERTY_PATTERN = Pattern.compile(
            "^([\\w\\.-]+)\\s*[:=]"
    );

    @Override
    public String getRuleCode() {
        return "DUPLICATE_CONFIGURATION_RULE";
    }

    @Override
    public String getName() {
        return "Duplicate Configuration Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            if (!filePath.endsWith(".properties")) {
                return; // Currently only evaluate properties files for duplicate configuration entries
            }

            String[] lines = content.split("\n");
            Set<String> definedKeys = new HashSet<>();

            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();

                // Skip comments and empty lines
                if (line.isEmpty() || line.startsWith("#") || line.startsWith("!")) {
                    continue;
                }

                Matcher matcher = PROPERTY_PATTERN.matcher(line);
                if (matcher.find()) {
                    String key = matcher.group(1).trim();

                    if (definedKeys.contains(key)) {
                        issues.add(Issue.builder()
                                .ruleCode(getRuleCode())
                                .title("Duplicate Configuration Key")
                                .description("Configuration key '" + key + "' is defined multiple times in " + filePath + ". The last defined value will overwrite preceding definitions, which can cause silent, unexpected behavior.")
                                .severity(SeverityLevel.LOW)
                                .category(IssueCategory.CONFIGURATION)
                                .filePath(filePath)
                                .lineNumber(i + 1)
                                .recommendation("Consolidate configuration definitions and remove the duplicate key entry.")
                                .build());
                    } else {
                        definedKeys.add(key);
                    }
                }
            }
        });

        return issues;
    }
}
