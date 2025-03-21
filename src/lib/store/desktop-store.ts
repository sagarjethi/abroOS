import { create } from 'zustand'
import { DesktopStore, WindowState } from '@/types/system'
import { DEFAULT_DESKTOP_ICONS } from '@/lib/apps/default-icons'

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  icons: DEFAULT_DESKTOP_ICONS,
  windows: [],
  activeWindowId: null,
  isStartMenuOpen: false,

  addWindow: (windowData) => {
    const { windows } = get()
    const maxZIndex = Math.max(0, ...windows.map(w => w.zIndex))
    const newWindow: WindowState = {
      id: crypto.randomUUID(),
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      zIndex: maxZIndex + 1,
      ...windowData,
    }

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: newWindow.id,
      isStartMenuOpen: false,
    }))
  },

  removeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    }))
  },

  setActiveWindow: (id) => {
    const { windows } = get()
    const maxZIndex = Math.max(0, ...windows.map(w => w.zIndex))
    
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, zIndex: maxZIndex + 1 }
          : w
      ),
      activeWindowId: id,
    }))
  },

  dispatchWindowAction: (action) => {
    const { removeWindow } = get()

    switch (action.type) {
      case 'MINIMIZE':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId
              ? { ...w, isMinimized: true }
              : w
          ),
        }))
        break

      case 'MAXIMIZE':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId
              ? { ...w, isMaximized: !w.isMaximized }
              : w
          ),
        }))
        break

      case 'CLOSE':
        removeWindow(action.windowId)
        break
    }
  },

  toggleStartMenu: () => {
    set((state) => ({
      isStartMenuOpen: !state.isStartMenuOpen,
    }))
  },
}))