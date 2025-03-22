import {
  Monitor,
  Terminal,
  Calculator,
  FileEdit,
  Calendar as CalendarIcon,
  Folder,
  Globe,
  Settings,
  Trash2,
  File,
  Image,
  Music,
  Video,
  FileText,
  FileSpreadsheet,
  Presentation,
  Mail,
  MessageSquare,
  Gamepad2,
  Store,
  HelpCircle,
  Power,
  RefreshCw,
  Moon,
} from 'lucide-react'

export const ICONS = {
  COMPUTER: Monitor,
  RECYCLE_BIN: Trash2,
  DOCUMENTS: Folder,
  SETTINGS: Settings,
  TRASH: Trash2,
  FOLDER: Folder,
  FILE: File,
  IMAGE: Image,
  MUSIC: Music,
  VIDEO: Video,
  PDF: FileText,
  WORD: FileText,
  EXCEL: FileSpreadsheet,
  POWERPOINT: Presentation,
  CALENDAR: CalendarIcon,
  CALCULATOR: Calculator,
  NOTEPAD: FileEdit,
  PAINT: Image,
  TERMINAL: Terminal,
  BROWSER: Globe,
  MAIL: Mail,
  CHAT: MessageSquare,
  GAMES: Gamepad2,
  STORE: Store,
  HELP: HelpCircle,
  SHUTDOWN: Power,
  RESTART: RefreshCw,
  SLEEP: Moon,
} as const

export type IconName = keyof typeof ICONS
export type IconComponent = typeof ICONS[IconName]

export interface DesktopIcon {
  id: string
  name: string
  icon: IconComponent
  appId: string
  color?: string
} 