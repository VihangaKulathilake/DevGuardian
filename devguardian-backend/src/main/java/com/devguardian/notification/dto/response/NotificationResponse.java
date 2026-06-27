package com.devguardian.notification.dto.response;

import com.devguardian.notification.enums.NotificationPriority;
import com.devguardian.notification.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private boolean isRead;
    private LocalDateTime createdAt;
}
