'use client'
  
import { create } from 'zustand'
import { useWindowStore } from './use-window-store'
import { ICONS, type DesktopIcon } from '@/types/icons'
  
interface DesktopState {
  desktopIcons: DesktopIcon[]
  openApp: (appId: string) => void
}
  
export const useDesktopStore = create<DesktopState>(() => ({
  desktopIcons: [
    {
      id: 'my-computer',
      name: 'My Computer',
      icon: ICONS.COMPUTER,
      appId: 'my-computer',
      color: 'text-indigo-400',
    },
    {
      id: 'recycle-bin',
      name: 'Recycle Bin',
      icon: ICONS.RECYCLE_BIN,
      appId: 'recycle-bin',
      color: 'text-red-400',
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: ICONS.DOCUMENTS,
      appId: 'documents',
      color: 'text-blue-400',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: ICONS.SETTINGS,
      appId: 'settings',
      color: 'text-gray-400',
    },
    {
      id: 'browser',
      name: 'Browser',
      icon: ICONS.BROWSER,
      appId: 'browser',
      color: 'text-blue-500',
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: ICONS.TERMINAL,
      appId: 'terminal',
      color: 'text-green-400',
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: ICONS.CALCULATOR,
      appId: 'calculator',
      color: 'text-yellow-400',
    },
    {
      id: 'notepad',
      name: 'Notepad',
      icon: ICONS.NOTEPAD,
      appId: 'notepad',
      color: 'text-orange-400',
    },
    {
      id: 'paint',
      name: 'Paint',
      icon: ICONS.PAINT,
      appId: 'paint',
      color: 'text-pink-400',
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: ICONS.CALENDAR,
      appId: 'calendar',
      color: 'text-rose-400',
    },
  ],
  openApp: (appId) => {
    const { windows } = useWindowStore.getState()
    const windowId = `${appId}-${Date.now()}`
    useWindowStore.setState({
      windows: [...windows, windowId],
    })
  },
})) 