'use client';

import React, { FC } from 'react'
import { AppConfig } from '@/types/system'

const AppStore: FC = () => <div>App Store</div>
const Browser: FC = () => <div>Browser</div>
const Calculator: FC = () => <div>Calculator</div>
const Calendar: FC = () => <div>Calendar</div>
const Camera: FC = () => <div>Camera</div>
const Clock: FC = () => <div>Clock</div>
const Files: FC = () => <div>Files</div>
const Mail: FC = () => <div>Mail</div>
const Maps: FC = () => <div>Maps</div>
const Messages: FC = () => <div>Messages</div>
const Music: FC = () => <div>Music</div>
const Notes: FC = () => <div>Notes</div>
const Photos: FC = () => <div>Photos</div>
const Settings: FC = () => <div>Settings</div>
const Terminal: FC = () => <div>Terminal</div>
const Weather: FC = () => <div>Weather</div>

export const appRegistry: Record<string, AppConfig> = {
  appStore: {
    id: 'appStore',
    name: 'App Store',
    icon: '/icons/app-store.png',
    component: AppStore,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: '/icons/browser.png',
    component: Browser,
    defaultSize: { width: 1024, height: 768 },
    isResizable: true,
    isMovable: true,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: '/icons/calculator.png',
    component: Calculator,
    defaultSize: { width: 320, height: 480 },
    isResizable: false,
    isMovable: true,
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    icon: '/icons/calendar.png',
    component: Calendar,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  camera: {
    id: 'camera',
    name: 'Camera',
    icon: '/icons/camera.png',
    component: Camera,
    defaultSize: { width: 640, height: 480 },
    isResizable: false,
    isMovable: true,
  },
  clock: {
    id: 'clock',
    name: 'Clock',
    icon: '/icons/clock.png',
    component: Clock,
    defaultSize: { width: 400, height: 400 },
    isResizable: false,
    isMovable: true,
  },
  files: {
    id: 'files',
    name: 'Files',
    icon: '/icons/files.png',
    component: Files,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  mail: {
    id: 'mail',
    name: 'Mail',
    icon: '/icons/mail.png',
    component: Mail,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  maps: {
    id: 'maps',
    name: 'Maps',
    icon: '/icons/maps.png',
    component: Maps,
    defaultSize: { width: 1024, height: 768 },
    isResizable: true,
    isMovable: true,
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    icon: '/icons/messages.png',
    component: Messages,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  music: {
    id: 'music',
    name: 'Music',
    icon: '/icons/music.png',
    component: Music,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  notes: {
    id: 'notes',
    name: 'Notes',
    icon: '/icons/notes.png',
    component: Notes,
    defaultSize: { width: 400, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  photos: {
    id: 'photos',
    name: 'Photos',
    icon: '/icons/photos.png',
    component: Photos,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: '/icons/settings.png',
    component: Settings,
    defaultSize: { width: 800, height: 600 },
    isResizable: true,
    isMovable: true,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: '/icons/terminal.png',
    component: Terminal,
    defaultSize: { width: 800, height: 400 },
    isResizable: true,
    isMovable: true,
  },
  weather: {
    id: 'weather',
    name: 'Weather',
    icon: '/icons/weather.png',
    component: Weather,
    defaultSize: { width: 400, height: 600 },
    isResizable: true,
    isMovable: true,
  },
}

export const APP_REGISTRY = appRegistry 