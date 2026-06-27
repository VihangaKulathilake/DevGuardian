package com.devguardian.notification.dto.response;

import com.devguardian.notification.enums.NotificationPriority;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationSummary {

    private String id;
    private String title;
    private boolean isRead;
    private NotificationPriority priority;
}
