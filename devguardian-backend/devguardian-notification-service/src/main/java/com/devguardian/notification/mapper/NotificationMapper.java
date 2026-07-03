package com.devguardian.notification.mapper;

import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.dto.response.NotificationResponse;
import com.devguardian.notification.dto.response.NotificationSummary;
import com.devguardian.notification.entity.Notification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationMapper {

    public Notification toEntity(NotificationRequest req) {
        return Notification.builder()
                .userId(req.getUserId() != null ? Long.valueOf(req.getUserId()) : null)
                .title(req.getTitle())
                .message(req.getMessage())
                .type(req.getType())
                .priority(req.getPriority())
                .repositoryId(req.getRepositoryId())
                .analysisId(req.getAnalysisId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .status(com.devguardian.notification.enums.NotificationStatus.SENT)
                .build();
    }

    public NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId() != null ? String.valueOf(n.getId()) : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .priority(n.getPriority())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    public NotificationSummary toSummary(Notification n) {
        return NotificationSummary.builder()
                .id(n.getId() != null ? String.valueOf(n.getId()) : null)
                .title(n.getTitle())
                .priority(n.getPriority())
                .isRead(n.isRead())
                .build();
    }
}
