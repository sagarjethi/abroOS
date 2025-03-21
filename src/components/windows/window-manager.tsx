'use client';

import { FC } from 'react';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { Window } from './window';

export const WindowManager: FC = () => {
  const { windows, dispatchWindowAction } = useDesktopStore();

  if (!windows || windows.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {windows.map((window) => (
        <Window
          key={window.id}
          window={window}
          onAction={dispatchWindowAction}
        />
      ))}
    </div>
  );
};