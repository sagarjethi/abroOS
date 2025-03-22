'use client'
  
import { useEffect, useState } from 'react'
import { Window } from '../windows/window'
import { useWindowStore } from '@/hooks/use-window-store'
import { DesktopIcon } from './desktop-icon'
import { Taskbar } from '../taskbar/taskbar'
import { StartMenu } from '../start-menu/start-menu'
import { useDesktopStore } from '@/hooks/use-desktop-store'
import { ContextMenu } from './context-menu'
import { useWindow } from '@/contexts/window-context'
import { apps } from '@/lib/apps'
  
export function Desktop() {
  const { windows } = useWindowStore()
  const { desktopIcons, openApp } = useDesktopStore()
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)
  const { addWindow } = useWindow()
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Handle escape key for closing menus, etc.
      }
    }
  
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }
  
  return (
    <div 
      className="h-[calc(100vh-48px)] w-full relative p-4 overflow-hidden"
      onContextMenu={handleContextMenu}
      onClick={() => setShowContextMenu(false)}
    >
      {/* Desktop Icons */}
      <div className="grid grid-cols-6 gap-4 md:grid-cols-8 lg:grid-cols-12">
        {apps.map((app) => (
          <DesktopIcon
            key={app.id}
            icon={app.icon}
            label={app.title}
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
            }}
          />
        ))}
      </div>
  
      {/* Windows */}
      {windows.map((windowId) => (
        <Window
          key={windowId}
          id={windowId}
          title="Window"
          initialPosition={{ x: 100, y: 100 }}
          initialSize={{ width: 800, height: 600 }}
        >
          <div className="p-4">
            Window Content
          </div>
        </Window>
      ))}
  
      {/* Taskbar */}
      <Taskbar />
  
      {/* Start Menu */}
      <StartMenu />
  
      {showContextMenu && (
        <ContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  )
} 