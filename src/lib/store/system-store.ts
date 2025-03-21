import { create } from 'zustand'
import { SystemState, Notification, DesktopIcon, WindowState } from '@/types/system'
import { persist } from 'zustand/middleware'
import { useThemeStore } from './theme-store'
import { useWallpaperStore } from './wallpaper-store'
import { useSettingsStore } from './settings-store'
import { useNotificationStore } from './notification-store'
import { useDesktopStore } from './desktop-store'
import { useWindowStore } from './window-store'
import { useTaskbarStore } from './taskbar-store'

interface SystemStore extends SystemState {
  setTheme: (theme: 'light' | 'dark') => void
  setWallpaper: (wallpaper: string) => void
  setVolume: (volume: number) => void
  setBrightness: (brightness: number) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void
  markNotificationAsRead: (notificationId: string) => void
  clearNotifications: () => void
  setDesktopIcons: (icons: DesktopIcon[]) => void
  setWindows: (windows: WindowState[]) => void
  setActiveWindowId: (windowId: string | null) => void
  setIsStartMenuOpen: (isOpen: boolean) => void
  setActiveAppId: (appId: string | null) => void
}

const DEFAULT_SYSTEM_STATE: SystemState = {
  desktopIcons: [],
  windows: [],
  activeWindowId: null,
  isStartMenuOpen: false,
  activeAppId: null,
  theme: 'dark',
  wallpaper: '/wallpapers/default.jpg',
  volume: 50,
  brightness: 100,
  notifications: [],
}

export const useSystemStore = create<SystemStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SYSTEM_STATE,

      setTheme: (theme) => {
        set(() => ({ theme }))
        useThemeStore.getState().setTheme(theme)
      },

      setWallpaper: (wallpaper) => {
        set(() => ({ wallpaper }))
        useWallpaperStore.getState().setWallpaper(wallpaper)
      },

      setVolume: (volume) => {
        set(() => ({ volume: Math.max(0, Math.min(100, volume)) }))
        useSettingsStore.getState().setVolume(volume)
      },

      setBrightness: (brightness) => {
        set(() => ({ brightness: Math.max(0, Math.min(100, brightness)) }))
        useSettingsStore.getState().setBrightness(brightness)
      },

      addNotification: (notification) => {
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
        }))
        useNotificationStore.getState().addNotification(notification)
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        }))
        useNotificationStore.getState().markNotificationAsRead(notificationId)
      },

      clearNotifications: () => {
        set(() => ({ notifications: [] }))
        useNotificationStore.getState().clearNotifications()
      },

      setDesktopIcons: (icons) => {
        set(() => ({ desktopIcons: icons }))
        icons.forEach(icon => {
          useDesktopStore.getState().addIcon(icon)
        })
      },

      setWindows: (windows) => {
        set(() => ({ windows }))
        windows.forEach(window => {
          useWindowStore.getState().addWindow(window)
        })
      },

      setActiveWindowId: (windowId) => {
        set(() => ({ activeWindowId: windowId }))
        useWindowStore.getState().setActiveWindow(windowId)
      },

      setIsStartMenuOpen: (isOpen) => {
        set(() => ({ isStartMenuOpen: isOpen }))
        useTaskbarStore.getState().setStartMenuOpen(isOpen)
      },

      setActiveAppId: (appId) => {
        set(() => ({ activeAppId: appId }))
        useTaskbarStore.getState().setActiveApp(appId)
      },
    }),
    {
      name: 'system-storage',
    }
  )
) 