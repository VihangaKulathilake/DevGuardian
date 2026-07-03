package com.devguardian.client;

import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.dto.response.NotificationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", path = "/api/v1/notifications")
public interface NotificationClient {

    @PostMapping
    NotificationResponse createNotification(@RequestBody NotificationRequest request);
}
