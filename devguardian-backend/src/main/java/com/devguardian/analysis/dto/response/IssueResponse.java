package com.devguardian.analysis.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;

@Schema(description = "Response representing a specific code vulnerability or lint issue detected during analysis")
@Getter
@Builder
public class IssueResponse {

    @Schema(description = "Unique issue identifier", example = "20001")
    private Long id;

    @Schema(description = "DevGuardian security rule code identifier", example = "SEC-001")
    private String ruleCode;

    @Schema(description = "Category of the issue (e.g. SECURITY, QUALITY, ARCHITECTURE)", example = "SECURITY")
    private IssueCategory category;

    @Schema(description = "Severity level of the issue (e.g. LOW, MEDIUM, HIGH, CRITICAL)", example = "HIGH")
    private SeverityLevel severity;

    @Schema(description = "Short, descriptive title of the issue", example = "Hardcoded Secret Token Found")
    private String title;

    @Schema(description = "Detailed explanation of the issue and why it poses a threat", example = "A hardcoded credentials token was found inside a source file, potentially compromising authentication.")
    private String description;

    @Schema(description = "Relative file path containing the issue", example = "src/main/resources/application.yaml")
    private String filePath;

    @Schema(description = "Line number in the file where the issue was detected", example = "23")
    private Integer lineNumber;

    @Schema(description = "Recommended remediation actions or guidelines", example = "Extract secrets to environment variables or use a secret vault.")
    private String recommendation;

    @Schema(description = "AI explanation of why this is an issue", example = "The secret is hardcoded and visible in source control.")
    private String aiExplanation;

    @Schema(description = "AI impact of this issue if exploited", example = "An attacker could compromise the service.")
    private String aiImpact;

    @Schema(description = "AI recommended fix for the issue", example = "Move the secret to an environment variable.")
    private String aiRecommendation;

    @Schema(description = "LLM model used for the AI analysis", example = "llama-3.1-8b-instant")
    private String aiModel;

    @Schema(description = "Timestamp when the AI analysis was generated")
    private LocalDateTime aiGeneratedAt;

    @Schema(description = "Actual codebase snippet matching the rule", example = "String secretKey = \"admin123\";")
    private String codeSnippet;
}