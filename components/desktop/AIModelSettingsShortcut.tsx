"use client";

import { useState } from 'react';
import { AIModelSettingsWindow } from './AIModelSettingsWindow';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AIModelSettingsShortcut() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer",
          "transition-colors duration-200",
          "hover:bg-accent/50 active:bg-accent/70",
          "group relative"
        )}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <div className={cn(
            "w-12 h-12 rounded-lg bg-primary/10",
            "flex items-center justify-center",
            "transition-transform duration-200",
            "group-hover:scale-110"
          )}>
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div className={cn(
            "absolute inset-0 rounded-lg",
            "bg-primary/20 opacity-0",
            "transition-opacity duration-200",
            "group-hover:opacity-100"
          )} />
        </div>
        <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">
          AI Settings
        </span>
        <div className={cn(
          "absolute -bottom-8 left-1/2 -translate-x-1/2",
          "px-2 py-1 rounded text-xs",
          "bg-background border shadow-sm",
          "opacity-0 transition-opacity duration-200",
          "group-hover:opacity-100",
          "whitespace-nowrap"
        )}>
          Configure AI Models
        </div>
      </div>

      {isOpen && (
        <AIModelSettingsWindow />
      )}
    </>
  );
} 