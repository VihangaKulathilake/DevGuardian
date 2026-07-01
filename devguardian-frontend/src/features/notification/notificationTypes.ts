export interface NotificationSummary {
  id: string;
  title: string;
  priority: string;
  isRead: boolean;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}
