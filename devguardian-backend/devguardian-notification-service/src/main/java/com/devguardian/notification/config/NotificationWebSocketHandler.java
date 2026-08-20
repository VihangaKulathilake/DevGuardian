package com.devguardian.notification.config;

import com.devguardian.notification.dto.response.NotificationResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = extractUserId(session.getUri());
        if (userId != null && !userId.isBlank()) {
            userSessions.computeIfAbsent(userId, k -> Collections.newSetFromMap(new ConcurrentHashMap<>()))
                    .add(session);
            log.info("WebSocket connection established for user ID {}. Active sessions: {}", userId,
                    userSessions.get(userId).size());
        } else {
            log.warn("WebSocket connection established without valid userId parameter. URI: {}", session.getUri());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = extractUserId(session.getUri());
        if (userId != null && userSessions.containsKey(userId)) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
            log.info("WebSocket connection closed for user ID {}. Status: {}", userId, status);
        }
    }

    public void sendNotificationToUser(String userId, NotificationResponse notification) {
        if (userId == null || !userSessions.containsKey(userId)) {
            log.debug("No active WebSocket sessions found for user ID {}", userId);
            return;
        }

        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        try {
            String jsonPayload = objectMapper.writeValueAsString(Map.of(
                    "type", "NEW_NOTIFICATION",
                    "notification", notification));
            TextMessage message = new TextMessage(jsonPayload);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                        log.info("Dispatched real-time notification to user ID {} over WebSocket session {}", userId,
                                session.getId());
                    } catch (IOException e) {
                        log.error("Failed to send WebSocket message to session {}", session.getId(), e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize notification for WebSocket dispatch", e);
        }
    }

    private String extractUserId(URI uri) {
        if (uri == null || uri.getQuery() == null) {
            return null;
        }
        String[] pairs = uri.getQuery().split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0 && "userId".equalsIgnoreCase(pair.substring(0, idx))) {
                return pair.substring(idx + 1);
            }
        }
        return null;
    }
}
