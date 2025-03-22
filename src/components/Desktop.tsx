"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AppIcon } from "@/types/global";

export default function Desktop() {
  const { windows, openWindow, isWindowOpen, focusWindow } = useWindows();
  const { desktopItems } = useFileSystem();
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());

  const handleIconOpen = useCallback((icon: AppIcon) => {
    if (isWindowOpen(icon.id)) {
      focusWindow(icon.id);
      return;
    }

    // Create a basic window with default content
    openWindow({
      id: icon.id,
      title: icon.title,
      content: { type: 'default', content: `Content for ${icon.title}` }
    });
  }, [isWindowOpen, focusWindow, openWindow]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 p-4 z-10">
        <div className="grid grid-cols-6 gap-4 h-full">
          {desktopItems.map((icon) => (
            <div
              key={icon.id}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md",
                "cursor-pointer highlight-hover",
                selectedIcons.has(icon.id) && "bg-primary/20"
              )}
              onClick={() => setSelectedIcons(new Set([icon.id]))}
              onDoubleClick={() => handleIconOpen(icon)}
            >
              <div className={cn("p-2", icon.color)}>
                <icon.icon className="w-8 h-8" />
              </div>
              <span className="text-sm mt-1 text-center">{icon.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Windows will be rendered here */}
    </div>
  );
} 