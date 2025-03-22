'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { type DesktopIcon } from '@/types/icons';

interface DesktopIconProps {
  icon: DesktopIcon;
  onDoubleClick: () => void;
}

export function DesktopIcon({ icon, onDoubleClick }: DesktopIconProps) {
  const [isSelected, setIsSelected] = useState(false);
  const Icon = icon.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded cursor-pointer select-none hover:bg-accent/10 transition-colors',
        isSelected && 'bg-accent/20'
      )}
      onClick={() => setIsSelected(true)}
      onDoubleClick={onDoubleClick}
    >
      <div className={cn('w-12 h-12 flex items-center justify-center', icon.color)}>
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-sm text-center text-foreground max-w-[100px] truncate">
        {icon.name}
      </span>
    </div>
  );
} 