package com.devguardian.notification.dto.request;

import com.devguardian.notification.enums.NotificationPriority;
import com.devguardian.notification.enums.NotificationType;
import lombok.Data;

import java.util.Map;

@Data
public class NotificationRequest {

    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;

    private String repositoryId;
    private String analysisId;

    private Map<String, Object> metadata;
}
