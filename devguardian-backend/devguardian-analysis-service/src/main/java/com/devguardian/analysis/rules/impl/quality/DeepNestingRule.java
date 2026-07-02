package com.devguardian.analysis.rules.impl.quality;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class DeepNestingRule implements AnalysisRule {

    private static final int MAX_NESTING_DEPTH = 4;

    // Pattern to match common control structures: if, for, while, switch
    private static final Pattern CONTROL_PATTERN = Pattern.compile(
            "\\b(if|for|while|switch)\\b\\s*\\("
    );

    @Override
    public String getRuleCode() {
        return "DEEP_NESTING_RULE";
    }

    @Override
    public String getName() {
        return "Deep Nesting Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            if (!filePath.endsWith(".java")) {
                return; // Focus on Java source code complexity
            }

            String[] lines = content.split("\n");
            int braceCount = 0;
            // Tracks the brace depth of each nested control statement
            List<Integer> controlBraceDepths = new ArrayList<>();

            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                String cleanLine = removeCommentsAndStrings(line);

                boolean lineHasControl = CONTROL_PATTERN.matcher(cleanLine).find();
                boolean lineOpensBrace = cleanLine.contains("{");

                // Parse characters to track brace depth changes
                for (int c = 0; c < cleanLine.length(); c++) {
                    char ch = cleanLine.charAt(c);
                    if (ch == '{') {
                        braceCount++;
                        // If this line opened a brace and had a control flow statement, track this depth
                        if (lineHasControl && lineOpensBrace) {
                            controlBraceDepths.add(braceCount);
                            
                            // Check nesting level
                            if (controlBraceDepths.size() > MAX_NESTING_DEPTH) {
                                issues.add(Issue.builder()
                                        .ruleCode(getRuleCode())
                                        .title("Deeply Nested Control Flow")
                                        .description("Nesting depth of " + controlBraceDepths.size() + " was detected, exceeding the recommended limit of " + MAX_NESTING_DEPTH + ". Deep nesting (arrow anti-pattern) makes code hard to follow and maintain.")
                                        .severity(SeverityLevel.LOW)
                                        .category(IssueCategory.CODE_QUALITY)
                                        .filePath(filePath)
                                        .lineNumber(i + 1)
                                        .recommendation("Simplify control structure nesting by using guard clauses, early returns, or refactoring blocks into separate methods.")
                                        .build());
                            }
                        }
                    } else if (ch == '}') {
                        // If we close a brace, check if it terminates any control flow block we are tracking
                        final int currentDepth = braceCount;
                        controlBraceDepths.removeIf(depth -> depth >= currentDepth);
                        braceCount--;
                    }
                }

                // Handle cases where the control statement is on one line and the brace opens on the next line
                if (lineHasControl && !lineOpensBrace && i < lines.length - 1) {
                    String nextLine = removeCommentsAndStrings(lines[i + 1]);
                    if (nextLine.contains("{")) {
                        // The control statement is matched, and the next line opens the brace.
                        // We will record the depth on the next iteration when '{' is parsed.
                        // To pass this info to the next line's processing, we temporarily allow lineHasControl to apply
                        lineHasControl = true;
                    }
                }
            }
        });

        return issues;
    }

    private String removeCommentsAndStrings(String line) {
        String result = line.replaceAll("\"[^\"]*\"", "\"\"");
        result = result.replaceAll("'[^']+'", "''");
        int commentIdx = result.indexOf("//");
        if (commentIdx != -1) {
            result = result.substring(0, commentIdx);
        }
        return result;
    }
}
