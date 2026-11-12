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
  },

  subscribeToStream: (onNotification: (notification: NotificationData) => void): (() => void) => {
    const token = localStorage.getItem('chambitas_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const streamUrl = `${baseUrl}/notifications/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let isClosed = false;

    const connect = () => {
      if (isClosed) return;

      try {
        eventSource = new EventSource(streamUrl, { withCredentials: true });

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === 'NEW_NOTIFICATION' && data.notification) {
              onNotification(data.notification);
            }
          } catch (e) {
            // Ignorar errores de parseo (e.g. heartbeat ping)
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (!isClosed) {
            // Reintentar conexión tras 5 segundos
            reconnectTimeout = setTimeout(connect, 5000);
          }
        };
      } catch (err) {
        console.error("Error conectando a stream de notificaciones:", err);
        if (!isClosed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    // Retorna función para desuscribirse
    return () => {
      isClosed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }
};
