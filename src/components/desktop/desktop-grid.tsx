'use client';
import { FC, useState } from 'react';
import Image from 'next/image';
import { DesktopIcon } from '@/types/system';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { cn } from '@/lib/utils';

interface DesktopIconProps {
  icon: DesktopIcon;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

const DesktopIconComponent: FC<DesktopIconProps> = ({
  icon,
  isSelected,
  onClick,
  onDoubleClick
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-24 h-24 p-2 rounded-lg',
        'hover:bg-white/10 cursor-pointer transition-colors',
        isSelected && 'bg-white/20'
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{
        position: 'absolute',
        left: icon.position?.x || 0,
        top: icon.position?.y || 0
      }}
    >
      <Image
        src={icon.icon}
        alt={icon.title}
        width={48}
        height={48}
        className="mb-2"
      />
      <span className="text-sm text-white text-center font-medium truncate w-full">
        {icon.title}
      </span>
    </div>
  );
};

export const DesktopGrid: FC = () => {
  const { icons, addWindow } = useDesktopStore();
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  const handleIconClick = (iconId: string) => {
    setSelectedIconId(iconId);
  };

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.onClick) {
      icon.onClick();
    }
    setSelectedIconId(null);
  };

  return (
    <div className="relative w-full h-full">
      {icons?.map((icon) => (
        <DesktopIconComponent
          key={icon.id}
          icon={icon}
          isSelected={selectedIconId === icon.id}
          onClick={() => handleIconClick(icon.id)}
          onDoubleClick={() => handleIconDoubleClick(icon)}
        />
      ))}
    </div>
  );
}; 