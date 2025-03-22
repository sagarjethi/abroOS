'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick: () => void;
}

export function DesktopIcon({ icon, label, onClick }: DesktopIconProps) {
  return (
    <button
      className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent/50 
                 transition-colors group focus:outline-none"
      onClick={onClick}
    >
      <div className="relative w-16 h-16">
        <Image
          src={icon}
          alt={label}
          fill
          className="object-contain p-2"
        />
      </div>
      <span className="text-sm text-center break-words w-full px-1
                     text-foreground group-hover:text-foreground/80">
        {label}
      </span>
    </button>
  );
} 