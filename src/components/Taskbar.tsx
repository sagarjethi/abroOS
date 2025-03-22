"use client";

import { useState } from "react";
import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Taskbar() {
  const { windows, focusWindow, updateWindow } = useWindows();
  const [showStartMenu, setShowStartMenu] = useState(false);

  const handleTaskbarClick = (windowId: string) => {
    const targetWindow = windows.find(w => w.id === windowId);
    if (!targetWindow) return;

    if (targetWindow.minimized) {
      // If window is minimized, restore it and focus it
      updateWindow(windowId, { minimized: false });
      focusWindow(windowId);
    } else if (targetWindow.focused) {
      // If window is focused, minimize it
      updateWindow(windowId, { minimized: true });
    } else {
      // If window is neither minimized nor focused, focus it
      focusWindow(windowId);
    }
  };

  return (
    <div className="h-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t flex items-center px-2 justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex space-x-1">
          {windows.map((window) => (
            <Button
              key={window.id}
              variant={window.focused ? "secondary" : "ghost"}
              className={cn(
                "h-8 transition-all",
                window.minimized && "opacity-50"
              )}
              onClick={() => handleTaskbarClick(window.id)}
            >
              {window.title}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center h-full">
        <div className="px-2 text-sm">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {showStartMenu && (
        <div className="absolute bottom-12 left-0 bg-background border rounded-t-lg p-4 shadow-lg w-64">
          <h3 className="font-medium mb-2">Start Menu</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              About
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 