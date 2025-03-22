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
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [previewWindow, setPreviewWindow] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { windows, activeWindow, minimizeWindow, maximizeWindow, closeWindow } = useWindowStore();
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
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-zinc-900/90 border-t border-zinc-800 flex items-stretch shadow-lg z-50">
        {/* Left section - Start button */}
        <div className="flex items-stretch">
          <Button
            variant="ghost"
            className={cn(
              'h-full w-12 rounded-none hover:bg-white/10 flex items-center justify-center',
              showStartMenu && 'bg-white/10'
            )}
            onClick={() => setShowStartMenu(!showStartMenu)}
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>

          {/* Active Windows */}
          <div className="flex items-stretch border-l border-zinc-800">
            {activeWindows.map(({ appId, windowIds, app }) => {
              const Icon = app?.icon;
              const isActive = windowIds.includes(activeWindow || '');
              const hasMultipleWindows = windowIds.length > 1;

              return (
                <ContextMenu key={appId}>
                  <ContextMenuTrigger>
                    <Button
                      variant="ghost"
                      className={cn(
                        'h-full px-4 rounded-none flex items-center gap-2 min-w-[8rem] max-w-[12rem] relative group',
                        isActive ? 'bg-white/20' : 'hover:bg-white/10 opacity-70'
                      )}
                      onMouseEnter={() => handleMouseEnter(windowIds[0])}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleTaskbarClick(windowIds[0])}
                    >
                      {Icon && <Icon className={cn('h-4 w-4', app?.color || 'text-white')} />}
                      <span className="text-sm text-white truncate">
                        {app?.name || appId}
                        {hasMultipleWindows && ` (${windowIds.length})`}
                      </span>
                      {hasMultipleWindows && (
                        <ChevronUp className="h-3 w-3 text-white absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent
                    className="min-w-[200px] bg-zinc-900/95 border border-zinc-800 text-white rounded-md shadow-lg"
                    onMouseEnter={() => handleMouseEnter(windowIds[0])}
                    onMouseLeave={handleMouseLeave}
                  >
                    {windowIds.map((windowId) => (
                      <ContextMenuItem
                        key={windowId}
                        onClick={() => maximizeWindow(windowId)}
                        className={cn(
                          'hover:bg-white/10',
                          windowId === activeWindow && 'bg-white/10'
                        )}
                      >
                        <span className="text-sm">{windowId.split('-')[0]}</span>
                      </ContextMenuItem>
                    ))}
                    <ContextMenuItem
                      className="text-red-400 hover:bg-red-500/20"
                      onClick={() => windowIds.forEach(closeWindow)}
                    >
                      Close All Windows
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>
        </div>

        {/* Right section - System tray */}
        <div className="flex items-stretch ml-auto">
          <div className="flex items-stretch border-l border-zinc-800">
            <Button
              variant="ghost"
              className="h-full w-12 rounded-none hover:bg-white/10 flex items-center justify-center"
            >
              <Volume2 className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="ghost"
              className="h-full w-12 rounded-none hover:bg-white/10 flex items-center justify-center"
            >
              <Wifi className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="ghost"
              className="h-full w-12 rounded-none hover:bg-white/10 flex items-center justify-center"
            >
              <Battery className="h-4 w-4 text-white" />
            </Button>
            <Clock />
          </div>
        </div>
      </div>

      {/* Window Previews */}
      {previewWindow && (
        <div 
          className="fixed bottom-12 left-0 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={() => setPreviewWindow(previewWindow)}
          onMouseLeave={handleMouseLeave}
        >
          {activeWindows.map(({ windowIds }) => 
            windowIds.map((windowId) => {
              if (windowId === previewWindow) {
                const appId = windowId.split('-')[0];
                const app = desktopIcons.find(icon => icon.appId === appId);
                return (
                  <WindowPreview
                    key={windowId}
                    windowId={windowId}
                    app={app}
                    isActive={windowId === activeWindow}
                    onClose={() => closeWindow(windowId)}
                    onMinimize={() => minimizeWindow(windowId)}
                    onMaximize={() => maximizeWindow(windowId)}
                    onFocus={() => maximizeWindow(windowId)}
                  />
                );
              }
              return null;
            })
          )}
        </div>
      )}

      {showStartMenu && (
        <StartMenu onClose={() => setShowStartMenu(false)} />
      )}
    </>
  );
} 