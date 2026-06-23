package com.devguardian.analysis.rules.impl.quality;

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
public class LongMethodRule implements AnalysisRule {

    private static final int MAX_METHOD_LINES = 100;

    // Pattern to identify method declarations. Matches access modifier, return type, name, arguments, throws clause, and opening brace
    private static final Pattern METHOD_DECLARATION_PATTERN = Pattern.compile(
            "\\b(?:public|protected|private|static|final|synchronized|void)\\s+[\\w<>\\.\\[\\]]+\\s+(\\w+)\\s*\\([^)]*\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public String getRuleCode() {
        return "LONG_METHOD_RULE";
    }

    @Override
    public String getName() {
        return "Long Method Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            if (!filePath.endsWith(".java")) {
                return; // Only analyze Java source files
            }

            String[] lines = content.split("\n");
            int braceCount = 0;
            int methodStartLine = -1;
            String currentMethodName = null;
            int methodBraceDepth = -1;

            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                String cleanLine = removeCommentsAndStrings(line);

                // Count braces to track depth
                for (int c = 0; c < cleanLine.length(); c++) {
                    char ch = cleanLine.charAt(c);
                    if (ch == '{') {
                        braceCount++;
                    } else if (ch == '}') {
                        braceCount--;

                        // Check if we just closed the method we were tracking
                        if (methodStartLine != -1 && braceCount == methodBraceDepth - 1) {
                            int methodLines = i - methodStartLine + 1;
                            if (methodLines > MAX_METHOD_LINES) {
                                issues.add(Issue.builder()
                                        .ruleCode(getRuleCode())
                                        .title("Long Method (" + currentMethodName + ")")
                                        .description("Method '" + currentMethodName + "' is " + methodLines + " lines long, which exceeds the limit of " + MAX_METHOD_LINES + " lines. Long methods are difficult to read, maintain, and unit test.")
                                        .severity(SeverityLevel.LOW)
                                        .category(IssueCategory.CODE_QUALITY)
                                        .filePath(filePath)
                                        .lineNumber(methodStartLine + 1)
                                        .recommendation("Refactor method '" + currentMethodName + "' by extracting smaller, logical helper methods (Extract Method pattern).")
                                        .build());
                            }
                            // Reset method tracking
                            methodStartLine = -1;
                            currentMethodName = null;
                            methodBraceDepth = -1;
                        }
                    }
                }

                // Look for method declaration when we're not currently tracking a method,
                // and we are inside class scope (braceCount >= 1)
                if (methodStartLine == -1 && braceCount >= 1) {
                    Matcher matcher = METHOD_DECLARATION_PATTERN.matcher(line);
                    if (matcher.find()) {
                        currentMethodName = matcher.group(1);
                        methodStartLine = i;
                        methodBraceDepth = braceCount; // Brace depth at method block level
                    }
                }
            }
        });

        return issues;
    }

    /**
     * Remove comments and string literals to prevent brace counting errors inside comments or string literals.
     */
    private String removeCommentsAndStrings(String line) {
        // Strip string literals "..." and character literals '.'
        String result = line.replaceAll("\"[^\"]*\"", "\"\"");
        result = result.replaceAll("'[^']+'", "''");
        // Strip single line comments
        int commentIdx = result.indexOf("//");
        if (commentIdx != -1) {
            result = result.substring(0, commentIdx);
        }
        return result;
    }
}
