import { useEffect, useRef } from "react";
import { NotificationResponse } from "@/features/notification/notificationTypes";

interface UseNotificationSocketProps {
  userId: string;
  onNotification: (notification: NotificationResponse) => void;
}

export const useNotificationSocket = ({
  userId,
  onNotification,
}: UseNotificationSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onNotificationRef = useRef(onNotification);

  // Keep latest callback ref to avoid reconnecting on callback change
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const connect = () => {
      // Clean up existing socket if any
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      // Connect to Gateway port 8080 or direct notification service
      const wsUrl = `${protocol}//${host}:8080/ws-notifications?userId=${encodeURIComponent(userId)}`;

      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log("[NotificationSocket] Connected to real-time notification stream");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === "NEW_NOTIFICATION" && data.notification) {
              console.log("[NotificationSocket] Real-time notification received:", data.notification);
              onNotificationRef.current?.(data.notification);
            }
          } catch (err) {
            console.error("[NotificationSocket] Failed to parse message:", err);
          }
        };

        ws.onerror = (err) => {
          console.warn("[NotificationSocket] WebSocket error:", err);
        };

        ws.onclose = (event) => {
          if (!isMounted) return;
          console.log("[NotificationSocket] Disconnected. Reconnecting in 5s...", event.reason);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) connect();
          }, 5000);
        };
      } catch (err) {
        console.error("[NotificationSocket] Connection initiation error:", err);
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) connect();
          }, 5000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [userId]);
};
