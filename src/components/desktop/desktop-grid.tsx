'use client';
import { FC, useState, useCallback, MouseEventHandler } from 'react';
import Image from 'next/image';
import { DesktopIcon } from '@/types/system';
import { useDesktopStore } from '@/lib/store/desktop-store';
import { cn } from '@/lib/utils';
import { APP_REGISTRY } from '@/lib/apps/registry';

interface DesktopIconProps {
  icon: DesktopIcon;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

const DesktopIconComponent: FC<DesktopIconProps> = ({
  icon,
  isSelected,
  onClick,
  onDoubleClick,
  onDragStart
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
      onMouseDown={onDragStart}
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
  const { icons, updateIconPosition, addWindow } = useDesktopStore();
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleIconClick = useCallback((e: React.MouseEvent, iconId: string) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIconIds((prev) =>
        prev.includes(iconId)
          ? prev.filter((id) => id !== iconId)
          : [...prev, iconId]
      );
    } else {
      setSelectedIconIds([iconId]);
    }
  }, []);

  const handleIconDoubleClick = useCallback((icon: DesktopIcon) => {
    const app = APP_REGISTRY[icon.appId];
    if (app) {
      addWindow({
        appId: app.id,
        title: app.name,
        icon: app.icon,
        size: app.defaultSize,
      });
    }
    setSelectedIconIds([]);
  }, [addWindow]);

  const handleIconDragStart = useCallback((e: React.MouseEvent, iconId: string) => {
    if (!selectedIconIds.includes(iconId)) {
      setSelectedIconIds([iconId]);
    }
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [selectedIconIds]);

  const handleIconDrag: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (!dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    selectedIconIds.forEach((iconId) => {
      const icon = icons.find((i) => i.id === iconId);
      if (icon) {
        updateIconPosition(iconId, {
          x: (icon.position?.x || 0) + deltaX,
          y: (icon.position?.y || 0) + deltaY,
        });
      }
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [dragStart, selectedIconIds, icons, updateIconPosition]);

  const handleIconDragEnd = useCallback(() => {
    setDragStart(null);
  }, []);

  const handleDesktopClick = useCallback(() => {
    setSelectedIconIds([]);
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onClick={handleDesktopClick}
      onMouseMove={dragStart ? handleIconDrag : undefined}
      onMouseUp={dragStart ? handleIconDragEnd : undefined}
      onMouseLeave={dragStart ? handleIconDragEnd : undefined}
    >
      {icons?.map((icon) => (
        <DesktopIconComponent
          key={icon.id}
          icon={icon}
          isSelected={selectedIconIds.includes(icon.id)}
          onClick={(e) => handleIconClick(e, icon.id)}
          onDoubleClick={() => handleIconDoubleClick(icon)}
          onDragStart={(e) => handleIconDragStart(e, icon.id)}
        />
      ))}
    </div>
  );
}; 