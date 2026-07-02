package com.devguardian.notification.controller;

import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.dto.response.NotificationResponse;
import com.devguardian.notification.dto.response.NotificationSummary;
import com.devguardian.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @PostMapping
    public NotificationResponse create(@RequestBody NotificationRequest request) {
        return service.create(request);
    }

    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getUserNotifications(@PathVariable String userId) {
        return service.getUserNotifications(userId);
    }

    @GetMapping("/{id}")
    public NotificationResponse getById(@PathVariable String id) {
        return service.getById(id);
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable String id) {
        service.markAsRead(id);
    }

    @PatchMapping("/read-all/{userId}")
    public void markAllAsRead(@PathVariable String userId) {
        service.markAllAsRead(userId);
    }

    @GetMapping("/unread-count/{userId}")
    public long unreadCount(@PathVariable String userId) {
        return service.getUnreadCount(userId);
    }
}
