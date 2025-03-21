import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WallpaperStore {
  wallpaper: string
  setWallpaper: (wallpaper: string) => void
}

export const useWallpaperStore = create<WallpaperStore>()(
  persist(
    (set) => ({
      wallpaper: '/wallpapers/default.jpg',

      setWallpaper: (wallpaper) =>
        set(() => ({
          wallpaper,
        })),
    }),
    {
      name: 'wallpaper-storage',
    }
  )
) 