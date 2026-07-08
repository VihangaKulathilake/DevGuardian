package com.devguardian.analysis.listener;

import com.devguardian.analysis.events.AnalysisCompletedEvent;
import com.devguardian.client.RepositoryClient;
import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.enums.NotificationPriority;
import com.devguardian.notification.enums.NotificationType;
import com.devguardian.repository.dto.RepositoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisCompletedListener {

    private final RabbitTemplate rabbitTemplate;
    private final RepositoryClient repositoryClient;

    @EventListener
    public void handleAnalysisCompleted(AnalysisCompletedEvent event) {
        log.info(
            "Analysis {} completed for repository {}",
            event.getAnalysisId(),
            event.getRepositoryId()
        );

        try {
            RepositoryResponse repository = repositoryClient.getRepository(event.getRepositoryId());
            if (repository != null && repository.getUserId() != null) {
                NotificationRequest notificationRequest = NotificationRequest.builder()
                        .userId(String.valueOf(repository.getUserId()))
                        .repositoryId(String.valueOf(repository.getId()))
                        .analysisId(String.valueOf(event.getAnalysisId()))
                        .title("Analysis Completed - " + repository.getName())
                        .message("Security analysis for repository '" + repository.getName() + "' has completed successfully.")
                        .type(NotificationType.SYSTEM)
                        .priority(NotificationPriority.MEDIUM)
                        .build();

                rabbitTemplate.convertAndSend(
                        "devguardian.exchange",
                        "notification.send",
                        notificationRequest
                );
                log.info("Sent notification message to RabbitMQ for user {}", repository.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to trigger notification for analysis completion", e);
        }
    }
}
