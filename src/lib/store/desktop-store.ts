import { create } from 'zustand'
import { DesktopStore, WindowState, Position } from '@/types/system'
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
      title: windowData.title || 'Untitled Window',
      appId: windowData.appId || 'default',
      position: windowData.position || { x: 100, y: 100 },
      size: windowData.size || { width: 800, height: 600 },
      zIndex: maxZIndex + 1,
      icon: windowData.icon || '/icons/file.svg',
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      ...windowData,
    }

    set((state) => ({
      windows: state.windows.map(w => ({ ...w, isFocused: false })).concat(newWindow),
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
          ? { ...w, zIndex: maxZIndex + 1, isFocused: true }
          : { ...w, isFocused: false }
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
              ? { ...w, isMinimized: !w.isMinimized }
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

      case 'FOCUS':
        const { windows } = get()
        const maxZIndex = Math.max(0, ...windows.map(w => w.zIndex))
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId
              ? { ...w, zIndex: maxZIndex + 1, isFocused: true, isMinimized: false }
              : { ...w, isFocused: false }
          ),
          activeWindowId: action.windowId,
        }))
        break

      case 'UPDATE_POSITION':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId
              ? { ...w, position: action.position }
              : w
          ),
        }))
        break

      case 'UPDATE_SIZE':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId
              ? { ...w, size: action.size }
              : w
          ),
        }))
        break
    }
  },

  toggleStartMenu: () => {
    set((state) => ({
      isStartMenuOpen: !state.isStartMenuOpen,
    }))
  },

  updateIconPosition: (iconId: string, position: Position) => {
    set((state) => ({
      icons: state.icons.map((icon) =>
        icon.id === iconId
          ? { ...icon, position }
          : icon
      ),
    }))
  },
}))