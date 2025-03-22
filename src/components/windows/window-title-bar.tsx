"use client"

import { Icons } from "@/components/ui/icons"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface WindowTitleBarProps {
  title: string
  icon: string
  isMaximized: boolean
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
  onPointerDown: (e: React.PointerEvent) => void
}

export function WindowTitleBar({
  title,
  icon,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
  onPointerDown,
}: WindowTitleBarProps) {
  return (
    <div
      className="flex items-center h-8 px-4 border-b border-border cursor-move"
      onPointerDown={onPointerDown}
    >
      <div className="flex items-center gap-2 flex-1">
        <Image
          src={icon}
          alt={title}
          width={16}
          height={16}
          className="rounded-sm"
        />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-accent/50"
          onClick={onMinimize}
        >
          <Icons.minimize className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-accent/50"
          onClick={onMaximize}
        >
          {isMaximized ? (
            <Icons.minimize className="h-4 w-4" />
          ) : (
            <Icons.maximize className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/50"
          onClick={onClose}
        >
          <Icons.close className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 