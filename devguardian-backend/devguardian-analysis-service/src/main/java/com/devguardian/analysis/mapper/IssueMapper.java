package com.devguardian.analysis.mapper;

import com.devguardian.analysis.dto.response.IssueResponse;
import com.devguardian.analysis.entity.Issue;

import org.springframework.stereotype.Component;

@Component
public class IssueMapper {
    public IssueResponse toIssueResponse(Issue issue) {

        String rec = issue.getAiRecommendation();
        if (rec == null || rec.isBlank()) {
            rec = issue.getRecommendation();
        }

        return IssueResponse.builder()
                .id(issue.getId())
                .ruleCode(issue.getRuleCode())
                .category(issue.getCategory())
                .severity(issue.getSeverity())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .filePath(issue.getFilePath())
                .lineNumber(issue.getLineNumber())
                .recommendation(rec)
                .aiExplanation(issue.getAiExplanation())
                .aiImpact(issue.getAiImpact())
                .aiRecommendation(issue.getAiRecommendation())
                .aiModel(issue.getAiModel())
                .aiGeneratedAt(issue.getAiGeneratedAt())
                .codeSnippet(issue.getCodeSnippet())
                .build();
    }
}
