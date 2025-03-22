{/* Copy of the current Window.tsx content */}
"use client";

import { motion } from "framer-motion";
import { useWindows } from "@/contexts/WindowsContext";
import { cn } from "@/lib/utils";
import { WindowTitleBar } from "./window/WindowTitleBar";
import { useWindowDrag } from "@/hooks/useWindowDrag";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const TASKBAR_HEIGHT = 48;
const RESIZE_HANDLE_SIZE = 6;

interface ResizeHandleProps {
  direction: string;
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
}

function ResizeHandle({ direction, onResizeStart }: ResizeHandleProps) {
  const getCursor = () => {
    switch (direction) {
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      case "nw":
      case "se":
        return "nwse-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      default:
        return "default";
    }
  };

  const getPosition = () => {
    const style: any = { position: "absolute" };
    if (direction.includes("n")) style.top = 0;
    if (direction.includes("s")) style.bottom = 0;
    if (direction.includes("e")) style.right = 0;
    if (direction.includes("w")) style.left = 0;
    return style;
  };

  const getSize = () => {
    const isCorner = direction.length === 2;
    return {
      width: direction.includes("e") || direction.includes("w") || isCorner ? RESIZE_HANDLE_SIZE : "100%",
      height: direction.includes("n") || direction.includes("s") || isCorner ? RESIZE_HANDLE_SIZE : "100%",
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart(e, direction);
  };

  return (
    <div
      className="absolute z-50"
      style={{
        cursor: getCursor(),
        ...getPosition(),
        ...getSize(),
      }}
      onMouseDown={handleMouseDown}
    />
  );
}

interface WindowProps {
  id: string;
  title: string;
  content: React.ReactNode;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  focused: boolean;
  minimized: boolean;
}

export default function Window({
  id,
  title,
  content,
  x,
  y,
  width,
  height,
  focused,
  minimized,
}: WindowProps) {
  const { closeWindow, focusWindow, updateWindow } = useWindows();

  const {
    state,
    isDragging,
    isResizing,
    windowRef,
    handleDragStart,
    handleResizeStart,
    toggleMaximize,
  } = useWindowDrag({
    id,
    initialState: {
      x,
      y,
      width,
      height,
      isMaximized: false,
    },
    minSize: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT,
    },
    taskbarHeight: TASKBAR_HEIGHT,
    onStateChange: (newState) => {
      updateWindow(id, {
        x: newState.x,
        y: newState.y,
        width: newState.width,
        height: newState.height,
      });
    },
  });

  if (minimized) return null;

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
      }}
      transition={{
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "fixed bg-background/95 backdrop-blur rounded-lg shadow-lg overflow-hidden border border-border",
        focused ? "z-50" : "z-40",
        (isDragging || isResizing) && "pointer-events-none select-none",
        isResizing && "transition-none"
      )}
      onClick={() => !focused && focusWindow(id)}
    >
      <WindowTitleBar
        title={title}
        isMaximized={state.isMaximized}
        onMinimize={() => updateWindow(id, { minimized: true })}
        onMaximize={toggleMaximize}
        onClose={() => closeWindow(id)}
        onPointerDown={handleDragStart}
      />

      <div className="p-4 overflow-auto" style={{ height: `calc(100% - 32px)` }}>
        {content}
      </div>

      {!state.isMaximized && (
        <>
          <ResizeHandle direction="n" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="s" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="e" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="w" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="nw" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="ne" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="sw" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="se" onResizeStart={handleResizeStart} />
        </>
      )}
    </motion.div>
  );
}