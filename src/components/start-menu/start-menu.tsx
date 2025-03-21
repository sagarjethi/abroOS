'use client';
import { FC } from 'react';
import Image from 'next/image';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { APP_REGISTRY } from '@/lib/apps/registry';

export const StartMenu: FC = () => {
  const { addWindow, toggleStartMenu } = useDesktopStore();

  const handleAppClick = (appId: string) => {
    addWindow(appId);
    toggleStartMenu();
  };

  return (
    <div className="fixed bottom-14 left-4 w-80 bg-background/80 backdrop-blur-md rounded-lg border border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">User</h3>
            <p className="text-sm text-muted-foreground">Local Account</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        <h4 className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Apps</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(APP_REGISTRY).map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex flex-col items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
            >
              <Image
                src={app.icon}
                alt={app.name}
                width={32}
                height={32}
                className="rounded-sm"
              />
              <span className="text-xs text-center font-medium truncate w-full">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 