import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  volume: number
  brightness: number
  setVolume: (volume: number) => void
  setBrightness: (brightness: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      volume: 50,
      brightness: 100,

      setVolume: (volume) =>
        set(() => ({
          volume: Math.max(0, Math.min(100, volume)),
        })),

      setBrightness: (brightness) =>
        set(() => ({
          brightness: Math.max(0, Math.min(100, brightness)),
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
) 