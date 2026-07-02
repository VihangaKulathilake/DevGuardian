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
public class GodClassRule implements AnalysisRule {

    private static final int MAX_FILE_LINES = 800;
    private static final int MAX_METHOD_COUNT = 30;
    private static final int MAX_FIELD_COUNT = 20;

    // Pattern to match method declarations
    private static final Pattern METHOD_PATTERN = Pattern.compile(
            "\\b(?:public|protected|private|static|final|synchronized|void)\\s+[\\w<>\\.\\[\\]]+\\s+(\\w+)\\s*\\([^)]*\\)\\s*(?:throws\\s+[\\w\\s,]+)?\\s*\\{",
            Pattern.CASE_INSENSITIVE
    );

    // Pattern to match field declarations (e.g. private String dbUrl; or public int count = 10;)
    private static final Pattern FIELD_PATTERN = Pattern.compile(
            "\\b(?:private|protected|public)\\s+(?!class|interface|enum|@|return)[\\w<>\\.\\[\\]]+\\s+\\w+\\s*(?:=\\s*[^;]+)?;$",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public String getRuleCode() {
        return "GOD_CLASS_RULE";
    }

    @Override
    public String getName() {
        return "God Class Detection";
    }

    @Override
    public List<Issue> evaluate(ScanContext context) {
        List<Issue> issues = new ArrayList<>();

        context.getFiles().forEach((filePath, content) -> {
            if (!filePath.endsWith(".java")) {
                return; // God Class is specific to OOP classes
            }

            // Skip entity classes, DTOs, and generated files as they naturally contain many fields/methods
            if (filePath.contains("/entity/") 
                    || filePath.contains("/dto/") 
                    || filePath.contains("/model/") 
                    || filePath.contains("Mapper") 
                    || filePath.contains("Generated")) {
                return;
            }

            String[] lines = content.split("\n");
            int totalLines = lines.length;
            int methodCount = 0;
            int fieldCount = 0;
            int braceCount = 0;

            for (String line : lines) {
                String cleanLine = removeCommentsAndStrings(line).trim();

                // Track brace depth
                for (int c = 0; c < cleanLine.length(); c++) {
                    char ch = cleanLine.charAt(c);
                    if (ch == '{') {
                        braceCount++;
                    } else if (ch == '}') {
                        braceCount--;
                    }
                }

                // Analyze lines that are in class-level scope (typically braceCount == 1)
                if (braceCount == 1) {
                    if (FIELD_PATTERN.matcher(cleanLine).find()) {
                        fieldCount++;
                    }
                }

                // Match methods at class level (usually braceCount starts at 1 and method header opens brace to 2)
                if (METHOD_PATTERN.matcher(line).find()) {
                    methodCount++;
                }
            }

            boolean isGodClass = totalLines > MAX_FILE_LINES 
                    || methodCount > MAX_METHOD_COUNT 
                    || fieldCount > MAX_FIELD_COUNT;

            if (isGodClass) {
                StringBuilder description = new StringBuilder();
                description.append("Class has excessive complexity (");
                List<String> violations = new ArrayList<>();
                if (totalLines > MAX_FILE_LINES) {
                    violations.add(totalLines + " lines > limit " + MAX_FILE_LINES);
                }
                if (methodCount > MAX_METHOD_COUNT) {
                    violations.add(methodCount + " methods > limit " + MAX_METHOD_COUNT);
                }
                if (fieldCount > MAX_FIELD_COUNT) {
                    violations.add(fieldCount + " fields > limit " + MAX_FIELD_COUNT);
                }
                description.append(String.join(", ", violations));
                description.append("). God Classes concentrate too much logic and violate the Single Responsibility Principle (SRP).");

                issues.add(Issue.builder()
                        .ruleCode(getRuleCode())
                        .title("God Class Detected")
                        .description(description.toString())
                        .severity(SeverityLevel.MEDIUM)
                        .category(IssueCategory.CODE_QUALITY)
                        .filePath(filePath)
                        .lineNumber(1)
                        .recommendation("Refactor this class by breaking it down into smaller, cohesive classes with distinct responsibilities.")
                        .build());
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
