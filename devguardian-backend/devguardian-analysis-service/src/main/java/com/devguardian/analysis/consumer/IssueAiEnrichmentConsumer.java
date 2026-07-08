package com.devguardian.analysis.consumer;

import com.devguardian.client.AiClient;
import com.devguardian.ai.model.AiIssueRequest;
import com.devguardian.ai.model.AiIssueResponse;
import com.devguardian.analysis.entity.Issue;
import com.devguardian.analysis.events.IssueCreatedEvent;
import com.devguardian.analysis.repository.IssueRepository;
import com.devguardian.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class IssueAiEnrichmentConsumer {

    private final AiClient aiClient;
    private final IssueRepository issueRepository;

    @RabbitListener(queues = RabbitMQConfig.ISSUE_CREATED_QUEUE)
    @Transactional
    public void handleIssueCreated(IssueCreatedEvent event) {
        log.info("Received IssueCreatedEvent from RabbitMQ for issue ID: {}", event.getIssueId());

        Issue issue = issueRepository.findById(event.getIssueId()).orElse(null);
        if (issue == null) {
            log.warn("Issue with ID {} not found in database", event.getIssueId());
            return;
        }

        try {
            AiIssueRequest request = AiIssueRequest.builder()
                    .issueType(issue.getType())
                    .fileName(issue.getFileName())
                    .codeSnippet(issue.getCodeSnippet())
                    .description(issue.getDescription())
                    .build();

            AiIssueResponse ai = aiClient.enrichIssue(request);

            issue.setAiExplanation(ai.getExplanation());
            issue.setAiImpact(ai.getImpact());
            issue.setAiRecommendation(ai.getRecommendation());
            issue.setAiModel(ai.getModelName());
            issue.setAiGeneratedAt(LocalDateTime.now());

            issueRepository.save(issue);
            log.info("Successfully enriched issue ID {} with AI details", event.getIssueId());
        } catch (Exception e) {
            log.error("Failed to enrich issue ID {} with AI details", event.getIssueId(), e);
        }
    }
}
