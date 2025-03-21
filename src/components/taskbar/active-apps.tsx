'use client';
import { FC } from 'react';
import Image from 'next/image';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { cn } from '@/lib/utils';

export const ActiveApps: FC = () => {
  const { windows, activeWindowId, setActiveWindow, dispatchWindowAction } = useDesktopStore();

  if (!windows || windows.length === 0) return null;

  return (
    <div className="flex items-center gap-1 mx-2">
      {windows.map((window) => (
        <button
          key={window.id}
          onClick={() => {
            if (window.isMinimized) {
              dispatchWindowAction({ type: 'MINIMIZE', windowId: window.id });
            }
            setActiveWindow(window.id);
          }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md',
            'hover:bg-accent/50 transition-colors',
            activeWindowId === window.id && 'bg-accent/30',
            window.isMinimized && 'opacity-50'
          )}
        >
          <Image
            src={window.icon}
            alt={window.title}
            width={16}
            height={16}
            className="shrink-0"
          />
          <span className="text-sm font-medium truncate max-w-[100px]">
            {window.title}
          </span>
        </button>
      ))}
    </div>
  );
}; 