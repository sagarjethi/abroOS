'use client';
import { FC } from 'react';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { StartMenu } from '../start-menu/start-menu';
import { ActiveApps } from './active-apps';
import { Clock } from './clock';

export const Taskbar: FC = () => {
  const { isStartMenuOpen, toggleStartMenu } = useDesktopStore();

  return (
    <>
      {isStartMenuOpen && <StartMenu />}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-background/80 backdrop-blur-md border-t border-border flex items-center px-4">
        <button
          onClick={toggleStartMenu}
          className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent/50 transition-colors"
        >
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
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
        <div className="ml-2 flex-1">
          <ActiveApps />
        </div>
        <Clock />
      </div>
    </>
  );
}; 