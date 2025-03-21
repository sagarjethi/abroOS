'use client';
import { FC } from 'react';
import Image from 'next/image';
import { APP_REGISTRY } from '@/lib/apps/registry';
import { useDesktopStore } from '@/lib/store/desktop-store';

export const AppList: FC = () => {
  const { addWindow } = useDesktopStore();

  const handleAppClick = (appId: string) => {
    const app = APP_REGISTRY[appId];
    if (!app) return;

    addWindow({
      id: `${appId}-${Date.now()}`,
      appId,
      title: app.name,
      position: { x: 100, y: 100 },
      size: { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {Object.values(APP_REGISTRY).map((app) => (
          <button
            key={app.id}
            onClick={() => handleAppClick(app.id)}
            className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-white/10 transition-colors"
          >
            <div className="relative w-12 h-12">
              <Image
                src={app.icon}
                alt={app.name}
                fill
                className="object-contain"
                sizes="48px"
              />
            </div>
            <span className="text-white text-sm text-center">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 