'use client';
import { FC } from 'react';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const WindowControls: FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-white/10"
        onClick={onMinimize}
      >
        <Icons.minimize className="h-4 w-4 text-white" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-white/10"
        onClick={onMaximize}
      >
        <Icons.maximize className="h-4 w-4 text-white" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-red-500"
        onClick={onClose}
      >
        <Icons.close className="h-4 w-4 text-white" />
      </Button>
    </div>
  );
}; 