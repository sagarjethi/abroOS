import { FC } from 'react'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number | string
  height: number | string
}

export interface DesktopIcon {
  id: string
  title: string
  icon: string
  position: Position
  appId: string
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
  title: string
  icon: string
  appId: string
  position: Position
  size: Size
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
}

export type WindowAction =
  | { type: 'MINIMIZE'; windowId: string }
  | { type: 'MAXIMIZE'; windowId: string }
  | { type: 'CLOSE'; windowId: string }
  | { type: 'FOCUS'; windowId: string }
  | { type: 'UPDATE_POSITION'; windowId: string; position: Position }
  | { type: 'UPDATE_SIZE'; windowId: string; size: Size }

export interface DesktopStore {
  icons: DesktopIcon[]
  windows: WindowState[]
  activeWindowId: string | null
  isStartMenuOpen: boolean
  addWindow: (windowData: Partial<WindowState>) => void
  removeWindow: (id: string) => void
  setActiveWindow: (id: string) => void
  dispatchWindowAction: (action: WindowAction) => void
  toggleStartMenu: () => void
  updateIconPosition: (iconId: string, position: Position) => void
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