package com.devguardian.analysis.listener;

import com.devguardian.analysis.events.AnalysisCompletedEvent;
import com.devguardian.notification.entity.Notification;
import com.devguardian.notification.enums.NotificationPriority;
import com.devguardian.notification.enums.NotificationStatus;
import com.devguardian.notification.enums.NotificationType;
import com.devguardian.notification.repository.NotificationRepository;
import com.devguardian.repository.entity.Repository;
import com.devguardian.repository.repository.RepositoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisCompletedListener {

    private final NotificationRepository notificationRepository;
    private final RepositoryRepository repositoryRepository;

    @EventListener
    public void handleAnalysisCompleted(AnalysisCompletedEvent event) {
        log.info(
            "Analysis {} completed for repository {}",
            event.getAnalysisId(),
            event.getRepositoryId()
        );

        try {
            repositoryRepository.findById(event.getRepositoryId()).ifPresent(repository -> {
                if (repository.getUserId() != null) {
                    Notification notification = Notification.builder()
                            .userId(repository.getUserId())
                            .repositoryId(String.valueOf(repository.getId()))
                            .analysisId(String.valueOf(event.getAnalysisId()))
                            .title("Analysis Completed - " + repository.getName())
                            .message("Security analysis for repository '" + repository.getName() + "' has completed successfully.")
                            .type(NotificationType.SYSTEM)
                            .status(NotificationStatus.SENT)
                            .priority(NotificationPriority.MEDIUM)
                            .isRead(false)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    notificationRepository.save(notification);
                    log.info("Saved notification for user {}", repository.getUserId());
                }
            });
        } catch (Exception e) {
            log.error("Failed to save notification for analysis completion", e);
        }
    }
}
