"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateRandomColor } from '@/lib/utils';
import type { AppIcon } from '@/types/global';
import { FileEdit, Folder, Monitor, Cloud, Terminal, Info, Calculator, Layout, FileQuestion, CalendarIcon, HardDrive, Globe, Code } from 'lucide-react';

// File system types that will be used throughout the application
export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'application';
  icon: string | React.FC;
  created: Date;
  modified: Date;
  size?: number;
  content?: string;
  parent?: string;
  color?: string;
  x?: number;
  y?: number;
}

interface FileSystemContextType {
  files: FileSystemItem[];
  desktopItems: AppIcon[];
  isInitialized: boolean;
  systemApps: AppIcon[];
  updateIconPosition: (positions: Record<string, { x: number; y: number }>) => void;
  updateIconTitle: (id: string, newTitle: string) => void;
  deleteIcon: (id: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [desktopItems, setDesktopItems] = useState<AppIcon[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [systemApps, setSystemApps] = useState<AppIcon[]>([]);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Initialize system apps
  useEffect(() => {
    const defaultSystemApps: AppIcon[] = [
      { id: "myPC", title: "My PC", icon: Monitor, x: 0, y: 0, color: "text-indigo-400", type: "app", isSystemApp: true },
      { id: "weather", title: "Weather", icon: Cloud, x: 1, y: 0, color: "text-sky-400", type: "app", isSystemApp: true },
      { id: "terminal", title: "Terminal", icon: Terminal, x: 0, y: 1, color: "text-green-400", type: "app", isSystemApp: true },
      { id: "aboutMe", title: "About Me", icon: Info, x: 1, y: 1, color: "text-cyan-400", type: "file", isSystemApp: true },
      { id: "calculator", title: "Calculator", icon: Calculator, x: 0, y: 2, color: "text-yellow-400", type: "app", isSystemApp: true },
      { id: "textEditor", title: "Text Editor", icon: FileEdit, x: 1, y: 2, color: "text-orange-400", type: "app", isSystemApp: true },
      { id: "memory", title: "Memory Game", icon: Layout, x: 0, y: 3, color: "text-purple-400", type: "app", isSystemApp: true },
      { id: "readme", title: "README", icon: FileQuestion, x: 1, y: 3, color: "text-blue-400", type: "app", isSystemApp: true },
      { id: "calendar", title: "Calendar", icon: CalendarIcon, x: 0, y: 4, color: "text-rose-400", type: "app", isSystemApp: true },
      { id: "fileSystem", title: "Files", icon: HardDrive, x: 1, y: 4, color: "text-emerald-400", type: "app", isSystemApp: true },
      { id: "browser", title: "Browser", icon: Globe, x: 0, y: 5, color: "text-blue-500", type: "app", isSystemApp: true },
      { id: "codeIndexer", title: "Code Indexer", icon: Code, x: 1, y: 5, color: "text-violet-400", type: "app", isSystemApp: true },
    ];
    setSystemApps(defaultSystemApps);
    setDesktopItems(defaultSystemApps);
    setIsInitialized(true);
  }, []);

  // Update icon position
  const updateIconPosition = (positions: Record<string, { x: number; y: number }>) => {
    setIconPositions(positions);
    setDesktopItems(prev => 
      prev.map(item => ({
        ...item,
        ...(positions[item.id] ? { x: positions[item.id].x, y: positions[item.id].y } : {})
      }))
    );
  };

  // Update icon title
  const updateIconTitle = (id: string, newTitle: string) => {
    setDesktopItems(prev => 
      prev.map(item => item.id === id ? { ...item, title: newTitle } : item)
    );
  };

  // Delete icon
  const deleteIcon = (id: string) => {
    setDesktopItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        desktopItems,
        isInitialized,
        systemApps,
        updateIconPosition,
        updateIconTitle,
        deleteIcon,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}; 