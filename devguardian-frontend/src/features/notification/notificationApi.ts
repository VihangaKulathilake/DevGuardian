import api from "@/api/axios";
import { NotificationResponse } from "./notificationTypes";

export const notificationApi = {
  async getUserNotifications(userId: string): Promise<NotificationResponse[]> {
    const response = await api.get<NotificationResponse[]>(`/api/v1/notifications/user/${userId}`);
    return response.data;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const response = await api.get<number>(`/api/v1/notifications/unread-count/${userId}`);
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/api/v1/notifications/${id}/read`);
  },

  async markAllAsRead(userId: string): Promise<void> {
    await api.patch(`/api/v1/notifications/read-all/${userId}`);
  },
};
