'use client'

import { apps } from '@/lib/apps'
import { useWindow } from '@/contexts/window-context'

interface StartMenuProps {
  onClose: () => void
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { addWindow } = useWindow()

  return (
    <div className="absolute bottom-12 left-0 w-80 bg-background border rounded-t-lg
                    shadow-lg overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Type to search..."
          className="w-full px-3 py-2 rounded-md bg-input"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 p-4">
        {apps.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center gap-2 p-2 rounded-lg
                       hover:bg-accent/50 transition-colors"
            onClick={() => {
              addWindow({
                id: app.id,
                title: app.title,
                icon: app.icon,
                component: app.component,
                position: { x: 100, y: 100 },
                size: { width: 800, height: 600 },
                isMinimized: false,
                isMaximized: false,
                zIndex: 1
              })
              onClose()
            }}
          >
            <img src={app.icon} alt={app.title} className="w-8 h-8" />
            <span className="text-sm">{app.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 