'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { WindowHeader } from './window-header'
import { WindowContent } from './window-content'
import { WindowResizeHandle } from './window-resize-handle'
import { WindowDragHandle } from './window-drag-handle'
import { useWindowStore } from '@/hooks/use-window-store'

export interface WindowProps {
  id: string
  title: string
  icon?: string
  children: React.ReactNode
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
}

export function Window({
  id,
  title,
  icon,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  minWidth = 200,
  minHeight = 200,
  maxWidth = window.innerWidth,
  maxHeight = window.innerHeight,
  className,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const { focusWindow, minimizeWindow, maximizeWindow, closeWindow } = useWindowStore()

  useEffect(() => {
    if (isFocused) {
      windowRef.current?.focus()
    }
  }, [isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    focusWindow(id)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    minimizeWindow(id)
  }

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
    maximizeWindow(id)
  }

  const handleClose = () => {
    closeWindow(id)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y

    const handleDrag = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      })
    }

    const handleDragEnd = () => {
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('mouseup', handleDragEnd)
    }

    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', handleDragEnd)
  }

  const handleResize = (direction: string, delta: { x: number; y: number }) => {
    setSize((prev) => {
      const newSize = {
        width: Math.min(Math.max(prev.width + delta.x, minWidth), maxWidth),
        height: Math.min(Math.max(prev.height + delta.y, minHeight), maxHeight),
      }
      return newSize
    })
  }

  return (
    <AnimatePresence>
      {!isMinimized && (
        <motion.div
          ref={windowRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute rounded-lg bg-background shadow-lg',
            isFocused && 'ring-2 ring-primary',
            className
          )}
          style={{
            top: isMaximized ? 0 : position.y,
            left: isMaximized ? 0 : position.x,
            width: isMaximized ? '100%' : size.width,
            height: isMaximized ? '100%' : size.height,
          }}
          onMouseDown={handleFocus}
          onBlur={handleBlur}
        >
          <WindowDragHandle onDragStart={handleDragStart} />
          <WindowHeader
            title={title}
            icon={icon}
            isMaximized={isMaximized}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />
          <WindowContent>{children}</WindowContent>
          <WindowResizeHandle onResize={handleResize} />
        </motion.div>
      )}
    </AnimatePresence>
  )
} 