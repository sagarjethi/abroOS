import { DesktopIcon, AppConfig } from '@/types/system'
import { APP_REGISTRY } from './registry'
import { useDesktopStore } from '@/lib/store/desktop-store'

export const DEFAULT_DESKTOP_ICONS: DesktopIcon[] = Object.values<AppConfig>(APP_REGISTRY).map((app, index) => ({
  id: app.id,
  title: app.name,
  icon: app.icon,
  position: {
    x: 20 + (index % 5) * 100,
    y: 20 + Math.floor(index / 5) * 100,
  },
  onClick: () => {
    const { addWindow } = useDesktopStore.getState()
    addWindow({
      appId: app.id,
      title: app.name,
      size: app.defaultSize,
    })
  },
})) 