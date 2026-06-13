package com.devguardian.analysis.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import lombok.Builder;
import lombok.Getter;

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
}