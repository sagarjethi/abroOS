"use client";

import { useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WindowProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  className?: string;
}

export function Window({
  title,
  icon,
  children,
  onClose,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 600, height: 400 },
  minSize = { width: 400, height: 300 },
  maxSize = { width: 1200, height: 800 },
  className,
}: WindowProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const dragControls = useDragControls();

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (direction: string) => {
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleResize = (event: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = event.movementX;
    const deltaY = event.movementY;

    let newSize = { ...size };

    if (resizeDirection.includes('right')) {
      newSize.width = Math.min(Math.max(size.width + deltaX, minSize.width), maxSize.width);
    }
    if (resizeDirection.includes('left')) {
      const newWidth = Math.min(Math.max(size.width - deltaX, minSize.width), maxSize.width);
      const deltaWidth = newWidth - size.width;
      newSize.width = newWidth;
      setPosition(prev => ({ ...prev, x: prev.x - deltaWidth }));
    }
    if (resizeDirection.includes('bottom')) {
      newSize.height = Math.min(Math.max(size.height + deltaY, minSize.height), maxSize.height);
    }
    if (resizeDirection.includes('top')) {
      const newHeight = Math.min(Math.max(size.height - deltaY, minSize.height), maxSize.height);
      const deltaHeight = newHeight - size.height;
      newSize.height = newHeight;
      setPosition(prev => ({ ...prev, y: prev.y - deltaHeight }));
    }

    setSize(newSize);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, resizeDirection]);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
        zIndex: 50,
      }}
      className={cn(
        "bg-background border rounded-lg shadow-lg overflow-hidden",
        isDragging && "cursor-grabbing",
        className
      )}
    >
      {children}

      {/* Resize handles */}
      <div
        className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize"
        onMouseDown={() => handleResizeStart('top-left')}
      />
      <div
        className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize"
        onMouseDown={() => handleResizeStart('top-right')}
      />
      <div
        className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize"
        onMouseDown={() => handleResizeStart('bottom-left')}
      />
      <div
        className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize"
        onMouseDown={() => handleResizeStart('bottom-right')}
      />
      <div
        className="absolute top-0 left-2 right-2 h-2 cursor-n-resize"
        onMouseDown={() => handleResizeStart('top')}
      />
      <div
        className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize"
        onMouseDown={() => handleResizeStart('bottom')}
      />
      <div
        className="absolute left-0 top-2 bottom-2 w-2 cursor-w-resize"
        onMouseDown={() => handleResizeStart('left')}
      />
      <div
        className="absolute right-0 top-2 bottom-2 w-2 cursor-e-resize"
        onMouseDown={() => handleResizeStart('right')}
      />
    </motion.div>
  );
} 