'use client';
import { DesktopGrid } from '@/components/desktop/desktop-grid';
import { Taskbar } from '@/components/taskbar/taskbar';
import { WindowManager } from '@/components/windows/window-manager';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <DesktopGrid />
      <WindowManager />
      <Taskbar />
    </main>
  );
}
