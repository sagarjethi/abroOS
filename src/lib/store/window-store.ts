import { create } from 'zustand'
import { WindowState, WindowAction } from '@/types/system'

interface WindowStore {
  windows: WindowState[]
  activeWindowId: string | null
  addWindow: (window: Omit<WindowState, 'id' | 'isMinimized' | 'isMaximized' | 'zIndex'>) => void
  removeWindow: (windowId: string) => void
  updateWindow: (windowId: string, updates: Partial<WindowState>) => void
  setActiveWindow: (windowId: string | null) => void
  handleWindowAction: (action: WindowAction) => void
  getWindow: (windowId: string) => WindowState | undefined
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,

  addWindow: (window) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      windows: [
        ...state.windows,
        {
          ...window,
          id,
          isMinimized: false,
          isMaximized: false,
          zIndex: state.windows.length,
        },
      ],
      activeWindowId: id,
    }))
  },

  removeWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== windowId),
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    })),

  updateWindow: (windowId, updates) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, ...updates } : w
      ),
    })),

  setActiveWindow: (windowId) =>
    set((state) => ({
      activeWindowId: windowId,
      windows: state.windows.map((w) => ({
        ...w,
        zIndex: w.id === windowId ? state.windows.length : w.zIndex,
      })),
    })),

  handleWindowAction: (action) => {
    const { windows, activeWindowId } = get()
    const window = windows.find((w) => w.id === action.windowId)
    if (!window) return

    switch (action.type) {
      case 'minimize':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId ? { ...w, isMinimized: true } : w
          ),
        }))
        break

      case 'maximize':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId ? { ...w, isMaximized: !w.isMaximized } : w
          ),
        }))
        break

      case 'close':
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== action.windowId),
          activeWindowId: activeWindowId === action.windowId ? null : activeWindowId,
        }))
        break

      case 'focus':
        set((state) => ({
          activeWindowId: action.windowId,
          windows: state.windows.map((w) => ({
            ...w,
            zIndex: w.id === action.windowId ? state.windows.length : w.zIndex,
          })),
        }))
        break

      case 'move':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId ? { ...w, position: action.position } : w
          ),
        }))
        break

      case 'resize':
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === action.windowId ? { ...w, size: action.size } : w
          ),
        }))
        break
    }
  },

  getWindow: (windowId) => get().windows.find((w) => w.id === windowId),
})) 