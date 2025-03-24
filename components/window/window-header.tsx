"use client";

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minimize2, Maximize2, X } from 'lucide-react';

interface WindowHeaderProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
}

export function WindowHeader({
  title,
  icon,
  onClose,
  onMinimize,
  onMaximize,
  className,
}: WindowHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 border-b bg-muted/50",
        "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="w-4 h-4">{icon}</div>}
        <h2 className="text-sm font-medium">{title}</h2>
      </div>

      <div className="flex items-center gap-1">
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMinimize}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
        )}
        {onMaximize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onMaximize}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 