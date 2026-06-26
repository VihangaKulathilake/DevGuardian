package com.devguardian.ai.listener;

import com.devguardian.ai.service.interfaces.AiAnalysisService;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.events.IssueCreatedEvent;
import com.devguardian.analysis.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class IssueAiEnrichmentListener {

    private final AiAnalysisService aiAnalysisService;
    private final IssueRepository issueRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleIssueCreated(IssueCreatedEvent event) {

        Issue eventIssue = event.getIssue();

        Issue issue = issueRepository.findById(eventIssue.getId()).orElse(null);
        if (issue == null) {
            return;
        }

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
        issue.setAiModel(ai.getModelName());
        issue.setAiGeneratedAt(LocalDateTime.now());

        issueRepository.save(issue);
    }
}