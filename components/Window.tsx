"use client";

import { motion } from "framer-motion";
import { useWindows } from "@/contexts/WindowsContext";
import { cn } from "@/lib/utils";
import { WindowTitleBar } from "./window/WindowTitleBar";
import { useWindowDrag } from "@/hooks/useWindowDrag";
import { TextEditor } from "./TextEditor";
import { FileExplorer } from "./FileExplorer";
import { AboutMeContent } from "./AboutMeContent";
import { SystemDashboard } from "./SystemDashboard";
import { Browser } from "./Browser";
import { CodeIndexer } from "./CodeIndexer";
import { AISearchAgent } from "./ai-search/AISearchAgent";
import type { Window as WindowType, WindowContent } from "@/types/global";

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const TASKBAR_HEIGHT = 48;
const RESIZE_HANDLE_SIZE = 8;

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
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(e, direction);
  };

  return (
    <div
      className="absolute z-50 hover:bg-accent/10"
      style={{
        cursor: getCursor(),
        ...getPosition(),
        ...getSize(),
      }}
      onMouseDown={handleMouseDown}
    />
  );
}

function renderContent(content: WindowContent): React.ReactNode {
  switch (content.type) {
    case 'text-editor':
      return <TextEditor id={content.id || ''} />;
    case 'file-explorer':
      if (content.folderId) {
        return <FileExplorer folderId={content.folderId} />;
      }
      if (content.icons) {
        return <FileExplorer icons={content.icons} />;
      }
      return <FileExplorer />;
    case 'about':
      return content.content;
    case 'browser':
      return <Browser />;
    case 'code-indexer':
      return <CodeIndexer />;
    case 'ai-search':
      return <AISearchAgent initialQuery={content.initialQuery || ''} initialMode={content.initialMode} />;
    case 'default':
      if (content.content) {
        return content.content;
      }
      return <div className="p-4">Default content</div>;
    case 'custom':
      if (content.render) {
        return content.render({ onClose: () => closeWindow(window.id) });
      }
      return <div className="p-4">Custom content without renderer</div>;
    default:
      return <div className="p-4">Unknown content type</div>;
  }
}

export default function Window(props: WindowType) {
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
    id: props.id,
    initialState: {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      isMaximized: false,
    },
    minSize: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT,
    },
    taskbarHeight: TASKBAR_HEIGHT,
    onStateChange: (newState) => {
      updateWindow(props.id, {
        x: newState.x,
        y: newState.y,
        width: newState.width,
        height: newState.height,
      });
    },
  });

  if (props.minimized) return null;

  return (
    <motion.div
      ref={windowRef}
      className={cn(
        "fixed rounded-lg shadow-lg flex flex-col bg-background border",
        "overflow-hidden",
        isResizing && "transition-none",
        isDragging && "cursor-grabbing",
        props.focused ? "border-primary" : "border-muted"
      )}
      style={{
        left: state.x,
        top: state.y,
        width: state.isMaximized ? "100%" : state.width,
        height: state.isMaximized ? `calc(100% - ${TASKBAR_HEIGHT}px)` : state.height,
        zIndex: props.zIndex,
      }}
      animate={{
        opacity: isDragging || isResizing ? 0.7 : 1,
      }}
      transition={{ duration: 0.1 }}
      onClick={() => focusWindow(props.id)}
    >
      <WindowTitleBar
        title={props.title}
        isMaximized={state.isMaximized}
        onPointerDown={handleDragStart}
        onClose={() => closeWindow(props.id)}
        onMinimize={() => updateWindow(props.id, { minimized: true })}
        onMaximize={toggleMaximize}
      />
      <div className="flex-1 overflow-hidden">{renderContent(props.content)}</div>

      {/* Resize handles */}
      {!state.isMaximized && (
        <>
          <ResizeHandle direction="n" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="e" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="s" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="w" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="ne" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="se" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="sw" onResizeStart={handleResizeStart} />
          <ResizeHandle direction="nw" onResizeStart={handleResizeStart} />
        </>
      )}
    </motion.div>
  );
}