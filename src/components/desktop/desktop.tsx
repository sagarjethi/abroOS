'use client'
  
import { useEffect } from 'react'
import { Window } from '../windows/window'
import { useWindowStore } from '@/hooks/use-window-store'
import { DesktopIcon } from './desktop-icon'
import { Taskbar } from '../taskbar/taskbar'
import { StartMenu } from '../start-menu/start-menu'
import { useDesktopStore } from '@/hooks/use-desktop-store'
  
export function Desktop() {
  const { windows } = useWindowStore()
  const { desktopIcons, openApp } = useDesktopStore()
  
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
  
  return (
    <div className="relative w-screen h-screen bg-background overflow-hidden">
      {/* Desktop Icons */}
      <div className="grid grid-cols-6 gap-4 p-4">
        {desktopIcons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            onDoubleClick={() => openApp(icon.appId)}
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
    </div>
  )
} 