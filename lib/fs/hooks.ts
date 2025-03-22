"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { fileSystem } from './db';
import type { FileSystemEntry, FileSystemOperationResult } from './types';

export function useFileSystem() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initFS = async () => {
      const result = await fileSystem.init();
      if (result.success) {
        setIsInitialized(true);
      } else {
        setError(result.error || new Error('Failed to initialize file system'));
      }
    };

    initFS();
  }, []);

  const createFile = async (
    name: string,
    content: string = '',
    parentId: string | null = null
  ): Promise<FileSystemOperationResult<FileSystemEntry>> => {
    return fileSystem.createEntry({
      name,
      type: 'file',
      content,
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        size: new Blob([content]).size,
        mimeType: 'text/plain',
      },
    });
  };

  const createDirectory = async (
    name: string,
    parentId: string | null = null
  ): Promise<FileSystemOperationResult<FileSystemEntry>> => {
    return fileSystem.createEntry({
      name,
      type: 'directory',
      parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const getEntry = async (id: string) => {
    return fileSystem.getEntry(id);
  };

  const updateEntry = async (id: string, updates: Partial<FileSystemEntry>) => {
    return fileSystem.updateEntry(id, updates);
  };

  const deleteEntry = async (id: string) => {
    return fileSystem.deleteEntry(id);
  };

  const listDirectory = async (parentId: string | null = null) => {
    return fileSystem.listDirectory(parentId);
  };

  return {
    isInitialized,
    error,
    createFile,
    createDirectory,
    getEntry,
    updateEntry,
    deleteEntry,
    listDirectory,
  };
}

/**
 * WindowManager Component
 * 
 * Manages the creation, focus, and manipulation of application windows
 * in the desktop environment. Handles window positioning, stacking order,
 * and state persistence.
 */
function WindowManager() {
  // State for tracking active windows
  const [windows, setWindows] = useState<Window[]>([]);
  
  // Reference to track the highest z-index for proper window stacking
  const nextZIndexRef = useRef(100);
  
  /**
   * Creates a new application window with the given configuration
   * 
   * @param config - Window configuration including position, size, and content
   * @returns string - The ID of the newly created window
   */
  const createWindow = useCallback((config: WindowConfig): string => {
    // Generate unique ID for the window
    const windowId = `window-${Date.now()}`;
    
    // Set default position if not provided
    const position = config.position || {
      x: 100 + (windows.length * 20), // Cascade windows by default
      y: 100 + (windows.length * 20)
    };
    
    // Create the window with default properties and provided config
    const newWindow: Window = {
      id: windowId,
      title: config.title || 'Untitled Window',
      content: config.content,
      position,
      size: config.size || { width: 600, height: 400 },
      isActive: true,
      isMinimized: false,
      zIndex: nextZIndexRef.current++
    };
    
    // Add the new window to state and deactivate other windows
    setWindows(prev => 
      prev.map(w => ({ ...w, isActive: false })).concat(newWindow)
    );
    
    // Save window state to persistent storage
    saveWindowState();
    
    return windowId;
  }, [windows, saveWindowState]);
  
  /**
   * Updates an existing window's properties
   * 
   * @param windowId - ID of the window to update
   * @param updates - Partial window properties to update
   */
  const updateWindow = useCallback((windowId: string, updates: Partial<Window>) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, ...updates } 
          : window
      )
    );
    
    // Save the updated state
    saveWindowState();
  }, [saveWindowState]);
  
  // Additional methods...
  
  return {
    windows,
    createWindow,
    updateWindow,
    // Other exported methods...
  };
}

// ModernDock.tsx - A dock-style navigation
export function ModernDock() {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-2xl bg-slate-800/70 backdrop-blur-lg border border-slate-700/50 flex items-center space-x-2">
      {dockItems.map(item => (
        <DockIcon 
          key={item.id}
          icon={item.icon}
          label={item.label}
          onClick={item.onClick}
          className="transition-all duration-200 hover:scale-125 hover:-translate-y-2"
        />
      ))}
    </div>
  );
}

// SidePanel.tsx - Widget container
export function SidePanel({ isOpen }) {
  return (
    <div className={`fixed right-0 top-0 h-full w-72 bg-slate-900/80 backdrop-blur-md border-l border-slate-700/50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 space-y-6">
        <SystemStats />
        <WeatherWidget />
        <QuickNotes />
        <RecentFiles />
      </div>
    </div>
  );
}