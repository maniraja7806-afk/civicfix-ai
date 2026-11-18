import { api } from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  getNotifications: async (): Promise<{
    success: boolean;
    unreadCount: number;
    count: number;
    notifications: NotificationItem[];
  }> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markRead: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<{ success: boolean }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};
