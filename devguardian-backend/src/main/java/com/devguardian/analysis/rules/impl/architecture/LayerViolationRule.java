package com.devguardian.analysis.rules.impl.architecture;

import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import com.devguardian.analysis.rules.context.ScanContext;
import com.devguardian.analysis.rules.interfaces.AnalysisRule;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LayerViolationRule implements AnalysisRule {

    // Matches @Controller or @RestController annotations
    private static final Pattern CONTROLLER_ANNOTATION_PATTERN = Pattern.compile(
            "@(RestController|Controller)\\b"
    );

    // Matches imports of entities (e.g., import com.devguardian.repository.entity.Repository; or import com.devguardian.analysis.entity.Analysis;)
    private static final Pattern ENTITY_IMPORT_PATTERN = Pattern.compile(
            "import\\s+[\\w\\.]+\\.entity\\.(\\w+)\\b;"
    );

    // Matches endpoint mappings
    private static final Pattern ENDPOINT_MAPPING_PATTERN = Pattern.compile(
            "@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping|PatchMapping)\\b"
    );

    @Override
    public String getRuleCode() {
        return "LAYER_VIOLATION_RULE";
    }

    @Override
    public String getName() {
        return "Layer Violation Detection";
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

            String[] lines = content.split("\n");
            Set<String> importedEntities = new HashSet<>();

            // 2. Scan imports for entities
            for (String line : lines) {
                Matcher importMatcher = ENTITY_IMPORT_PATTERN.matcher(line.trim());
                if (importMatcher.find()) {
                    importedEntities.add(importMatcher.group(1));
                }
            }

            if (importedEntities.isEmpty()) {
                return; // No entities imported in this controller
            }

            // 3. Scan controller methods for entity signatures
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i].trim();

                // Skip comments
                if (line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) {
                    continue;
                }

                // Check if this line defines a mapping endpoint method signature
                if (ENDPOINT_MAPPING_PATTERN.matcher(line).find() && i < lines.length - 1) {
                    // Check next few lines (the method signature is usually on the line immediately following the mapping annotation)
                    for (int next = 1; next <= 2 && (i + next) < lines.length; next++) {
                        String methodSignature = lines[i + next].trim();
                        if (methodSignature.isEmpty() || methodSignature.startsWith("@")) {
                            continue; // Skip other annotations
                        }

                        // Search if any imported entity is referenced in the signature
                        for (String entity : importedEntities) {
                            // Match entity usage (either return type, inside generics like List<Entity> or ResponseEntity<Entity>, or parameter type)
                            Pattern entityUsagePattern = Pattern.compile(
                                    "\\b" + entity + "\\b"
                            );

                            if (entityUsagePattern.matcher(methodSignature).find()) {
                                issues.add(Issue.builder()
                                        .ruleCode(getRuleCode())
                                        .title("Entity Exposed in Controller API")
                                        .description("Controller method references database Entity '" + entity + "' directly in its API signature. Exposing entities couples database schemas directly to API contracts, which can lead to serialization issues or mass assignment vulnerabilities.")
                                        .severity(SeverityLevel.MEDIUM)
                                        .category(IssueCategory.CODE_QUALITY)
                                        .filePath(filePath)
                                        .lineNumber(i + next + 1)
                                        .recommendation("Introduce a Data Transfer Object (DTO) class (e.g., " + entity + "Response or " + entity + "Request) and map between the Entity and DTO in the service tier.")
                                        .build());
                                break; // Only generate one layer violation issue per mapping endpoint
                            }
                        }
                        break; // Signature found and evaluated
                    }
                }
            }
        });

        return issues;
    }
}
