import { create } from 'zustand'
import { AppRegistry, AppConfig } from '@/types/system'

interface AppRegistryStore {
  apps: AppRegistry
  registerApp: (app: AppConfig) => void
  unregisterApp: (appId: string) => void
  getApp: (appId: string) => AppConfig | undefined
}

export const useAppRegistryStore = create<AppRegistryStore>((set, get) => ({
  apps: {},

  registerApp: (app) =>
    set((state) => ({
      apps: {
        ...state.apps,
        [app.id]: app,
      },
    })),

  unregisterApp: (appId) =>
    set((state) => {
      const apps = { ...state.apps }
      delete apps[appId]
      return { apps }
    }),

  getApp: (appId) => get().apps[appId],
})) 