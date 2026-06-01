package com.devguardian.analysis.mapper;

import com.devguardian.analysis.dto.response.IssueResponse;
import com.devguardian.analysis.entity.Issue;

public class IssueMapper {
    public IssueResponse toIssueResponse(Issue issue) {

        return IssueResponse.builder()
                .id(issue.getId())
                .ruleCode(issue.getRuleCode())
                .category(issue.getCategory())
                .severity(issue.getSeverity())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .filePath(issue.getFilePath())
                .lineNumber(issue.getLineNumber())
                .recommendation(issue.getRecommendation())
                .build();
    }
}
