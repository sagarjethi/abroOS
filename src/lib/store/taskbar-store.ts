import { create } from 'zustand'

interface TaskbarStore {
  isStartMenuOpen: boolean
  activeAppId: string | null
  setStartMenuOpen: (isOpen: boolean) => void
  setActiveApp: (appId: string | null) => void
}

export const useTaskbarStore = create<TaskbarStore>((set) => ({
  isStartMenuOpen: false,
  activeAppId: null,

  setStartMenuOpen: (isOpen) =>
    set(() => ({
      isStartMenuOpen: isOpen,
    })),

  setActiveApp: (appId) =>
    set(() => ({
      activeAppId: appId,
    })),
})) 