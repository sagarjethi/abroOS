'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

interface WindowDragProps {
  initialState: WindowState;
  minSize: {
    width: number;
    height: number;
  };
  taskbarHeight: number;
  onStateChange: (state: WindowState) => void;
}

interface WindowDragState {
  state: WindowState;
  isDragging: boolean;
  isResizing: boolean;
  windowRef: React.RefObject<HTMLDivElement | null>;
  handleDragStart: (e: React.PointerEvent) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string) => void;
  toggleMaximize: () => void;
}

export function useWindowDrag({
  initialState,
  minSize,
  taskbarHeight,
  onStateChange,
}: WindowDragProps): WindowDragState {
  const [state, setState] = useState<WindowState>(initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, direction: '' });
  const windowRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - state.x,
      y: e.clientY - state.y,
    });
  }, [state.x, state.y]);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (e.button !== 0) return;
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      direction,
    });
  }, []);

  const toggleMaximize = useCallback(() => {
    setState((prev) => {
      const newState = {
        ...prev,
        isMaximized: !prev.isMaximized,
        x: prev.isMaximized ? initialState.x : 0,
        y: prev.isMaximized ? initialState.y : 0,
        width: prev.isMaximized ? initialState.width : window.innerWidth,
        height: prev.isMaximized ? initialState.height : window.innerHeight - taskbarHeight,
      };
      onStateChange(newState);
      return newState;
    });
  }, [initialState, taskbarHeight, onStateChange]);

  useEffect(() => {
    const handleDrag = (e: PointerEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setState((prev) => {
        const newState = {
          ...prev,
          x: Math.max(0, Math.min(newX, window.innerWidth - prev.width)),
          y: Math.max(0, Math.min(newY, window.innerHeight - prev.height - taskbarHeight)),
        };
        onStateChange(newState);
        return newState;
      });
    };

    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setState((prev) => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        let newX = prev.x;
        let newY = prev.y;

        if (resizeStart.direction.includes('e')) {
          newWidth = Math.max(minSize.width, prev.width + deltaX);
        }
        if (resizeStart.direction.includes('w')) {
          const widthDelta = Math.min(deltaX, prev.width - minSize.width);
          newWidth = prev.width - widthDelta;
          newX = prev.x + widthDelta;
        }
        if (resizeStart.direction.includes('s')) {
          newHeight = Math.max(minSize.height, prev.height + deltaY);
        }
        if (resizeStart.direction.includes('n')) {
          const heightDelta = Math.min(deltaY, prev.height - minSize.height);
          newHeight = prev.height - heightDelta;
          newY = prev.y + heightDelta;
        }

        const newState = {
          ...prev,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        };
        onStateChange(newState);
        return newState;
      });

      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        direction: resizeStart.direction,
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handleDrag);
      window.addEventListener('pointerup', handleDragEnd);
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('pointermove', handleDrag);
      window.removeEventListener('pointerup', handleDragEnd);
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, minSize, taskbarHeight, onStateChange]);

  return {
    state,
    isDragging,
    isResizing,
    windowRef,
    handleDragStart,
    handleResizeStart,
    toggleMaximize,
  };
} 