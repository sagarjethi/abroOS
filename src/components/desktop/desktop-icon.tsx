'use client';

import { FC } from 'react';
import Image from 'next/image';
import { DesktopIcon as DesktopIconType } from '@/types/system';

interface DesktopIconProps extends DesktopIconType {
  onClick: () => void;
  isSelected?: boolean;
}

export const DesktopIcon: FC<DesktopIconProps> = ({
  name,
  icon,
  onClick,
  isSelected = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-md
        hover:bg-white/10 transition-colors
        ${isSelected ? 'bg-white/20' : ''}
      `}
    >
      <div className="relative w-12 h-12">
        <Image
          src={icon}
          alt={name}
          fill
          className="object-contain"
          sizes="48px"
        />
      </div>
      <span className="text-white text-sm text-center max-w-[100px] truncate">
        {name}
      </span>
    </button>
  );
}; 