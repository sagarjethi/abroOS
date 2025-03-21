'use client';
import { FC } from 'react';
import { Window, WindowAction } from '@/types/system';
import { WindowControls } from './window-controls';
import { APP_REGISTRY } from '@/lib/apps/registry';

interface WindowFrameProps extends Window {
  onAction: (action: WindowAction) => void;
}

export const WindowFrame: FC<WindowFrameProps> = ({
  id,
  appId,
  title,
  position,
  size,
  isMinimized,
  isMaximized,
  zIndex,
  onAction,
}) => {
  const app = APP_REGISTRY[appId];
  if (!app) return null;

  const AppComponent = app.component;

  return (
    <div
      className={`
        fixed bg-[#1a1b1e] border border-white/10 rounded-lg shadow-lg
        ${isMinimized ? 'hidden' : ''}
        ${isMaximized ? 'fixed inset-0' : ''}
      `}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100%' : size.width,
        height: isMaximized ? '100%' : size.height,
        zIndex,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 h-10 bg-[#2a2b2e] rounded-t-lg border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4">
              <img
                src={app.icon}
                alt={app.name}
                className="object-contain"
              />
            </div>
            <span className="text-white text-sm">{title}</span>
          </div>
          <WindowControls
            onMinimize={() => onAction({ type: 'MINIMIZE', windowId: id })}
            onMaximize={() => onAction({ type: 'MAXIMIZE', windowId: id })}
            onClose={() => onAction({ type: 'CLOSE', windowId: id })}
          />
        </div>
        <div className="flex-1 overflow-auto">
          <AppComponent />
        </div>
      </div>
    </div>
  );
}; 