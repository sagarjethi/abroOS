'use client';
import { FC } from 'react';
import Image from 'next/image';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { Button } from '@/components/ui/button';

export const ActiveApps: FC = () => {
  const { windows, dispatchWindowAction } = useDesktopStore();

  return (
    <div className="flex items-center gap-1">
      {windows.map((window) => (
        <Button
          key={window.id}
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          onClick={() => dispatchWindowAction({ type: 'FOCUS', windowId: window.id })}
        >
          <Image
            src={window.icon}
            alt={window.title}
            width={16}
            height={16}
            className="rounded-sm"
          />
          {window.isMinimized && (
            <div className="absolute inset-0 bg-background/50 rounded-sm" />
          )}
        </Button>
      ))}
    </div>
  );
}; 