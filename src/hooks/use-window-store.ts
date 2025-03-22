'use client'
  
import { create } from 'zustand'
  
interface WindowState {
  windows: string[]
  activeWindow: string | null
  minimizedWindows: string[]
  maximizedWindows: string[]
  addWindow: (windowId: string) => void
  removeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  closeWindow: (windowId: string) => void
  setActiveWindow: (windowId: string | null) => void
}
  
export const useWindowStore = create<WindowState>((set) => ({
  windows: [],
  activeWindow: null,
  minimizedWindows: [],
  maximizedWindows: [],
  addWindow: (windowId) =>
    set((state) => ({
      windows: [...state.windows, windowId],
      activeWindow: windowId,
    })),
  removeWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.filter((id) => id !== windowId),
      activeWindow: state.activeWindow === windowId ? null : state.activeWindow,
      minimizedWindows: state.minimizedWindows.filter((id) => id !== windowId),
      maximizedWindows: state.maximizedWindows.filter((id) => id !== windowId),
    })),
  minimizeWindow: (windowId) =>
    set((state) => ({
      minimizedWindows: [...state.minimizedWindows, windowId],
      activeWindow: state.activeWindow === windowId ? null : state.activeWindow,
    })),
  maximizeWindow: (windowId) =>
    set((state) => ({
      maximizedWindows: [...state.maximizedWindows, windowId],
      minimizedWindows: state.minimizedWindows.filter((id) => id !== windowId),
      activeWindow: windowId,
    })),
  closeWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.filter((id) => id !== windowId),
      activeWindow: state.activeWindow === windowId ? null : state.activeWindow,
      minimizedWindows: state.minimizedWindows.filter((id) => id !== windowId),
      maximizedWindows: state.maximizedWindows.filter((id) => id !== windowId),
    })),
  setActiveWindow: (windowId) =>
    set({
      activeWindow: windowId,
    }),
})) 