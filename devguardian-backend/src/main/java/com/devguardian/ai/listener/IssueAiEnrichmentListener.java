package com.devguardian.ai.listener;

import com.devguardian.ai.service.interfaces.AiAnalysisService;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.events.IssueCreatedEvent;
import com.devguardian.analysis.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IssueAiEnrichmentListener {

    private final AiAnalysisService aiAnalysisService;
    private final IssueRepository issueRepository;

    @Async
    @EventListener
    public void handleIssueCreated(IssueCreatedEvent event) {

        Issue issue = event.getIssue();

        AiIssueRequest request = AiIssueRequest.builder()
                .issueType(issue.getType())
                .fileName(issue.getFileName())
                .codeSnippet(issue.getCodeSnippet())
                .description(issue.getDescription())
                .build();

        AiIssueResponse ai = aiAnalysisService.analyze(request);

        issue.setAiExplanation(ai.getExplanation());
        issue.setAiImpact(ai.getImpact());
        issue.setAiRecommendation(ai.getRecommendation());

        issueRepository.save(issue);
    }
}