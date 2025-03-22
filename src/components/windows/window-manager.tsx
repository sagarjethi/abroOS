'use client';

import { useDesktopStore } from '@/lib/store/desktop-store';
import { Window } from './window';

export function WindowManager() {
  const { windows } = useDesktopStore();

  if (!windows || windows.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {windows.map((window) => (
        <Window key={window.id} {...window} />
      ))}
    </div>
  );
}