package com.devguardian.notification.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class MarkAsReadRequest {
    private List<String> notificationIds;
}
