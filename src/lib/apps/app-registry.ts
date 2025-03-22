import { AppConfig } from '@/types/system';
import { Browser } from '@/components/apps/browser';
import { FileExplorer } from '@/components/apps/file-explorer';
import { Terminal } from '@/components/apps/terminal';
import { Calculator } from '@/components/apps/calculator';
import { Settings } from '@/components/apps/settings';

export const APP_REGISTRY: Record<string, AppConfig> = {
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: '/icons/browser.svg',
    component: Browser,
    defaultSize: { width: 1024, height: 768 },
    isResizable: true,
    isMovable: true,
  },
  fileExplorer: {
    id: 'fileExplorer',
    name: 'File Explorer',
    icon: '/icons/folder.svg',
    component: FileExplorer,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: '/icons/terminal.svg',
    component: Terminal,
    defaultSize: { width: 600, height: 400 },
    isResizable: true,
    isMovable: true,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: '/icons/calculator.svg',
    component: Calculator,
    defaultSize: { width: 300, height: 400 },
    isResizable: false,
    isMovable: true,
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: '/icons/settings.svg',
    component: Settings,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
}; 