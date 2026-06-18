import { apiClient } from "./api-client";

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  metadata_json: string;
  read_at?: string;
  created_at: string;
}

export interface ListNotificationsResponse {
  notifications: NotificationData[];
  total: number;
  unread_count: number;
}

export const notificationApi = {
  getNotifications: async (limit: number = 20, offset: number = 0): Promise<ListNotificationsResponse> => {
    try {
      const response = await apiClient.get('/notifications', { params: { limit, offset } });
      return response.data;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      return { notifications: [], total: 0, unread_count: 0 };
    }
  },

  markAsRead: async (id: string): Promise<boolean> => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      return true;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      return false;
    }
  }
};
