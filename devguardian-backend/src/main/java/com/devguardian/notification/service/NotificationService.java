package com.devguardian.notification.service;

import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.dto.response.NotificationResponse;
import com.devguardian.notification.dto.response.NotificationSummary;

import java.util.List;

public interface NotificationService {

    NotificationResponse create(NotificationRequest request);

    List<NotificationSummary> getUserNotifications(String userId);

    NotificationResponse getById(String id);

    void markAsRead(String id);

    void markAllAsRead(String userId);

    long getUnreadCount(String userId);
}
