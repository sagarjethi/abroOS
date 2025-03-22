'use client'
  
interface WindowDragHandleProps {
  onDragStart: (e: React.MouseEvent) => void
}
  
export function WindowDragHandle({ onDragStart }: WindowDragHandleProps) {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-8 cursor-move"
      onMouseDown={onDragStart}
    />
  )
} 