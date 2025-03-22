'use client';
import { useState, useRef, useEffect } from 'react';
import { Menu, Volume2, Wifi, Battery, X, Minus, Square, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWindowStore } from '@/hooks/use-window-store';
import { useDesktopStore } from '@/hooks/use-desktop-store';
import { Clock } from './clock';
import { StartMenu } from '../start-menu/start-menu';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { LucideIcon } from 'lucide-react';
import { useWindow } from '@/contexts/window-context';
import { TaskbarItem } from './taskbar-item';
import { SystemTray } from './system-tray';

interface DesktopIcon {
  appId: string;
  name: string;
  icon: LucideIcon;
  color?: string;
}

interface WindowPreviewProps {
  windowId: string;
  app: DesktopIcon | undefined;
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
}

function WindowPreview({ windowId, app, isActive, onClose, onMinimize, onMaximize, onFocus }: WindowPreviewProps) {
  const Icon = app?.icon;

  return (
    <div 
      className={cn(
        'w-64 bg-zinc-900/95 border border-zinc-800 rounded-lg overflow-hidden shadow-lg',
        isActive && 'ring-2 ring-white/20'
      )}
    >
      <div className="flex items-center justify-between p-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={cn('h-4 w-4', app?.color || 'text-white')} />}
          <span className="text-sm text-white truncate">{app?.name || windowId.split('-')[0]}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            <Minus className="h-3 w-3 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
          >
            <Square className="h-3 w-3 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 hover:bg-white/10 hover:bg-red-500/20 hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="h-3 w-3 text-white" />
          </Button>
        </div>
      </div>
      <div 
        className="p-4 hover:bg-white/5 cursor-pointer"
        onClick={onFocus}
      >
        <div className="w-full h-32 bg-zinc-800 rounded flex items-center justify-center">
          {Icon && <Icon className={cn('h-12 w-12', app?.color || 'text-white')} />}
        </div>
      </div>
    </div>
  );
}

export function Taskbar() {
  const { windows, focusWindow, minimizeWindow } = useWindow();
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [previewWindow, setPreviewWindow] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { desktopIcons } = useDesktopStore();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const handleTaskbarClick = (windowId: string) => {
    if (windowId === activeWindow) {
      minimizeWindow(windowId);
    } else {
      maximizeWindow(windowId);
    }
    setPreviewWindow(null); // Hide preview when clicking
  };

  // Group windows by app
  const groupedWindows = windows.reduce((groups, windowId) => {
    const appId = windowId.split('-')[0];
    if (!groups[appId]) {
      groups[appId] = [];
    }
    groups[appId].push(windowId);
    return groups;
  }, {} as Record<string, string[]>);

  // Get active windows with their app info
  const activeWindows = Object.entries(groupedWindows).map(([appId, windowIds]) => {
    const app = desktopIcons.find(icon => icon.appId === appId);
    return { appId, windowIds, app };
  });

  const handleMouseEnter = (windowId: string) => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = setTimeout(() => {
      setPreviewWindow(windowId);
    }, 300); // Reduced delay for better responsiveness
  };

  const handleMouseLeave = () => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    setPreviewWindow(null);
  };

  return (
    <div className="h-12 w-full bg-background border-t flex items-center px-2 fixed bottom-0">
      <button
        className="h-8 w-8 flex items-center justify-center rounded-md 
                   hover:bg-accent transition-colors"
        onClick={() => setShowStartMenu(!showStartMenu)}
      >
        <img src="/icons/start.png" alt="Start" className="h-6 w-6" />
      </button>

      <div className="flex-1 flex items-center gap-1 px-2">
        {windows.map((window) => (
          <TaskbarItem
            key={window.id}
            title={window.title}
            icon={window.icon}
            isActive={!window.isMinimized}
            onClick={() => {
              if (window.isMinimized) {
                minimizeWindow(window.id);
                focusWindow(window.id);
              } else {
                minimizeWindow(window.id);
              }
            }}
          />
        ))}
      </div>

      <SystemTray />

      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}
    </div>
  );
} 