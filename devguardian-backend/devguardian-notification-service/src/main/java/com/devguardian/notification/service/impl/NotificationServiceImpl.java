package com.devguardian.notification.service.impl;

import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.dto.response.NotificationResponse;
import com.devguardian.notification.dto.response.NotificationSummary;
import com.devguardian.notification.entity.Notification;
import com.devguardian.notification.mapper.NotificationMapper;
import com.devguardian.notification.repository.NotificationRepository;
import com.devguardian.notification.service.NotificationService;
import com.devguardian.notification.config.NotificationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;
    private final NotificationMapper mapper;
    private final NotificationWebSocketHandler webSocketHandler;

    @Override
    public NotificationResponse create(NotificationRequest request) {
        Notification notification = mapper.toEntity(request);
        NotificationResponse response = mapper.toResponse(repository.save(notification));
        if (request.getUserId() != null) {
            webSocketHandler.sendNotificationToUser(String.valueOf(request.getUserId()), response);
        }
        return response;
    }

    @Override
    public List<NotificationResponse> getUserNotifications(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId != null ? Long.valueOf(userId) : null)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public NotificationResponse getById(String id) {
        Notification n = repository.findById(id != null ? Long.valueOf(id) : null)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return mapper.toResponse(n);
    }

    @Override
    public void markAsRead(String id) {
        Notification n = repository.findById(id != null ? Long.valueOf(id) : null).orElseThrow();
        n.setRead(true);
        repository.save(n);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> list = repository.findByUserIdOrderByCreatedAtDesc(userId != null ? Long.valueOf(userId) : null);
        list.forEach(n -> n.setRead(true));
        repository.saveAll(list);
    }

    @Override
    public long getUnreadCount(String userId) {
        return repository.countByUserIdAndIsReadFalse(userId != null ? Long.valueOf(userId) : null);
    }
}
