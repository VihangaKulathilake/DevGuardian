package com.devguardian.notification.consumer;

import com.devguardian.notification.dto.request.NotificationRequest;
import com.devguardian.notification.service.NotificationService;
import com.devguardian.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_SEND_QUEUE)
    public void handleNotificationRequest(NotificationRequest request) {
        log.info("Received NotificationRequest from RabbitMQ for user: {}", request.getUserId());
        try {
            notificationService.create(request);
            log.info("Successfully persisted notification for user: {}", request.getUserId());
        } catch (Exception e) {
            log.error("Failed to process notification request from queue", e);
        }
    }
}
