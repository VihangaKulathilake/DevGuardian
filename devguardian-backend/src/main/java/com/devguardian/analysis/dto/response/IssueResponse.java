package com.devguardian.analysis.dto.response;

import com.devguardian.analysis.enums.IssueCategory;
import com.devguardian.analysis.enums.SeverityLevel;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IssueResponse {

    private Long id;

    private String ruleCode;

    private IssueCategory category;

    private SeverityLevel severity;

    private String title;

    private String description;

    private String filePath;

    private Integer lineNumber;

    private String recommendation;
}