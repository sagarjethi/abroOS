"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Calculator, 
  FileEdit,
  Monitor,
  Info,
  Cloud,
  Layout,
  FileQuestion,
  Settings,
  Calendar as CalendarIcon
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Calculator as CalculatorApp } from "@/components/Calculator";
import { WeatherApp } from "@/components/WeatherApp";
import { MemoryGame } from "@/components/MemoryGame";
import { ReadmeContent } from "@/components/ReadmeContent";
import { AboutMeContent } from "@/components/AboutMeContent";
import { Calendar } from "@/components/Calender";
import type { WindowContent } from "@/types/global";

interface StartMenuProps {
  onClose: () => void;
}

interface AppDefinition {
  id: string;
  title: string;
  icon: typeof Terminal;
  color: string;
  content: WindowContent;
  width: number;
  height: number;
}

const apps: AppDefinition[] = [
  { 
    id: "weather", 
    title: "Weather", 
    icon: Cloud,
    color: "text-sky-400",
    content: {
      type: 'default',
      content: <WeatherApp />
    },
    width: 400,
    height: 500
  },
  { 
    id: "terminal", 
    title: "Terminal", 
    icon: Terminal,
    color: "text-green-400",
    content: {
      type: 'default',
      content: (
        <div className="font-mono p-4 bg-black text-green-400">
          <p>Terminal not implemented yet.</p>
          <p className="animate-pulse">▋</p>
        </div>
      )
    },
    width: 600,
    height: 400
  },
  { 
    id: "aboutMe", 
    title: "About Me", 
    icon: Info,
    color: "text-cyan-400",
    content: {
      type: 'about',
      content: <AboutMeContent />
    },
    width: 600,
    height: 400
  },
  { 
    id: "calculator", 
    title: "Calculator", 
    icon: Calculator,
    color: "text-yellow-400",
    content: {
      type: 'default',
      content: <CalculatorApp />
    },
    width: 300,
    height: 450
  },
  { 
    id: "textEditor", 
    title: "Text Editor", 
    icon: FileEdit,
    color: "text-orange-400",
    content: {
      type: 'text-editor',
      id: 'textEditor'
    },
    width: 800,
    height: 600
  },
  { 
    id: "memory", 
    title: "Memory Game", 
    icon: Layout,
    color: "text-purple-400",
    content: {
      type: 'default',
      content: <MemoryGame />
    },
    width: 450,
    height: 600
  },
  { 
    id: "readme", 
    title: "README", 
    icon: FileQuestion,
    color: "text-blue-400",
    content: {
      type: 'default',
      content: <ReadmeContent />
    },
    width: 600,
    height: 400
  },
  { 
    id: "calendar", 
    title: "Calendar", 
    icon: CalendarIcon,
    color: "text-rose-400",
    content: {
      type: 'default',
      content: <Calendar />
    },
    width: 400,
    height: 500
  },
  { 
    id: "settings", 
    title: "Settings", 
    icon: Settings,
    color: "text-neutral-400",
    content: {
      type: 'default',
      content: (
        <div className="p-4 prose dark:prose-invert">
          <h2>Settings</h2>
          <p>System settings will be implemented soon.</p>
        </div>
      )
    },
    width: 600,
    height: 400
  },
];

export default function StartMenu({ onClose }: StartMenuProps) {
  const { openWindow } = useWindows();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 0);

    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const handleAppClick = (app: AppDefinition) => {
    const centerX = (window.innerWidth - app.width) / 2;
    const centerY = (window.innerHeight - app.height) / 2;
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 200;

    openWindow({
      id: app.id,
      title: app.title,
      content: app.content,
      x: Math.max(50, Math.min(centerX + offsetX, window.innerWidth - app.width - 50)),
      y: Math.max(50, Math.min(centerY + offsetY, window.innerHeight - app.height - 50)),
      width: app.width,
      height: app.height,
    });
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute bottom-12 left-0 w-80 bg-card/95 backdrop-blur rounded-lg shadow-lg border border-border overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 grid grid-cols-1 gap-1">
        {apps.map((app) => (
          <Button
            key={app.id}
            variant="ghost"
            className="w-full justify-start h-10 px-2 gap-3"
            onClick={() => handleAppClick(app)}
          >
            <app.icon className={`h-5 w-5 ${app.color}`} />
            <span className="font-medium">{app.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}