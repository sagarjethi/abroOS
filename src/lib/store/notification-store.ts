import { create } from 'zustand'
import { Notification } from '@/types/system'

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void
  markNotificationAsRead: (notificationId: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          isRead: false,
        },
      ],
    })),

  markNotificationAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    })),

  clearNotifications: () =>
    set(() => ({
      notifications: [],
    })),
})) 