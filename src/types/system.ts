import { FC } from 'react'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface DesktopIcon {
  id: string
  title: string
  icon: string
  position: Position
  onClick: () => void
}

export interface AppConfig {
  id: string
  name: string
  icon: string
  component: FC
  defaultSize: Size
  isResizable: boolean
  isMovable: boolean
}

export interface WindowState {
  id: string
  appId: string
  title: string
  position: Position
  size: Size
  zIndex: number
  isMinimized?: boolean
  isMaximized?: boolean
}

export type WindowAction = 
  | { type: 'MINIMIZE'; windowId: string }
  | { type: 'MAXIMIZE'; windowId: string }
  | { type: 'CLOSE'; windowId: string }

export interface DesktopStore {
  icons: DesktopIcon[]
  windows: WindowState[]
  activeWindowId: string | null
  isStartMenuOpen: boolean
  
  addWindow: (windowData: Partial<WindowState> & { appId: string; title: string }) => void
  removeWindow: (id: string) => void
  setActiveWindow: (id: string) => void
  dispatchWindowAction: (action: WindowAction) => void
  toggleStartMenu: () => void
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

export interface SystemState {
  theme: 'light' | 'dark' | 'system'
  wallpaper: string
  notifications: Notification[]
  volume: number
  brightness: number
  isStartMenuOpen: boolean
  activeWindowId: string | null
  windows: WindowState[]
}

export interface App {
  id: string
  name: string
  icon: string
  component: FC
}

export type AppRegistry = Record<string, AppConfig>

export interface AppDefinition {
  id: string
  name: string
  icon: string
  component: FC
  defaultSize?: Size
  defaultPosition?: Position
  isResizable?: boolean
  isMovable?: boolean
  isMinimizable?: boolean
  isMaximizable?: boolean
  isClosable?: boolean
}

export interface Window {
  id: string;
  appId: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
} 