'use client'

import { Button } from '@/components/ui/button'
import { Minimize2, Maximize2, X } from 'lucide-react'

interface WindowHeaderProps {
  title: string
  icon?: string
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
}

export function WindowHeader({
  title,
  icon,
  onMinimize,
  onMaximize,
  onClose,
}: WindowHeaderProps) {
  return (
    <div className="flex items-center justify-between h-8 px-2 bg-muted/50 border-b">
      <div className="flex items-center gap-2">
        {icon && (
          <img src={icon} alt={title} className="w-4 h-4" />
        )}
        <span className="text-sm font-medium truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={onMinimize}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={onMaximize}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 