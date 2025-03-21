import { AppConfig } from '@/types/system'
import dynamic from 'next/dynamic'

// Dynamically import app components
const FileExplorer = dynamic(() => import('@/components/apps/file-explorer'))
const Settings = dynamic(() => import('@/components/apps/settings'))
const Terminal = dynamic(() => import('@/components/apps/terminal'))
const Browser = dynamic(() => import('@/components/apps/browser'))

export const APP_REGISTRY: Record<string, AppConfig> = {
  'file-explorer': {
    id: 'file-explorer',
    name: 'File Explorer',
    icon: '/icons/file-explorer.svg',
    component: FileExplorer,
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: 100, y: 100 }
  },
  'settings': {
    id: 'settings',
    name: 'Settings',
    icon: '/icons/settings.svg',
    component: Settings,
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: 150, y: 150 }
  },
  'terminal': {
    id: 'terminal',
    name: 'Terminal',
    icon: '/icons/terminal.svg',
    component: Terminal,
    defaultSize: { width: 600, height: 400 },
    defaultPosition: { x: 200, y: 200 }
  },
  'browser': {
    id: 'browser',
    name: 'Browser',
    icon: '/icons/browser.svg',
    component: Browser,
    defaultSize: { width: 1024, height: 768 },
    defaultPosition: { x: 250, y: 250 }
  }
}

export const DEFAULT_DESKTOP_ICONS = [
  {
    id: 'file-explorer',
    name: 'File Explorer',
    icon: '/icons/file-explorer.svg',
    type: 'app' as const,
    position: { x: 20, y: 20 }
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '/icons/settings.svg',
    type: 'app' as const,
    position: { x: 100, y: 20 }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '/icons/terminal.svg',
    type: 'app' as const,
    position: { x: 180, y: 20 }
  },
  {
    id: 'browser',
    name: 'Browser',
    icon: '/icons/browser.svg',
    type: 'app' as const,
    position: { x: 260, y: 20 }
  }
] 