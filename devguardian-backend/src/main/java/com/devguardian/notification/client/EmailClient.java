package com.devguardian.notification.client;

public interface EmailClient {
    void sendEmail(String to, String subject, String body);
}
