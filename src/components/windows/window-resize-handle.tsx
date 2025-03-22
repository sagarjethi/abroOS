'use client'
  
import { useEffect } from 'react'
  
interface WindowResizeHandleProps {
  onResize: (direction: string, delta: { x: number; y: number }) => void
}
  
export function WindowResizeHandle({ onResize }: WindowResizeHandleProps) {
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const startX = e.clientX
      const startY = e.clientY
  
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY
  
        // Only trigger resize if mouse has moved more than 5px
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          onResize('se', { x: deltaX, y: deltaY })
        }
      }
  
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
  
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
  
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [onResize])
  
  return (
    <div
      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
      style={{
        background: 'linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.1) 50%)',
      }}
    />
  )
} 