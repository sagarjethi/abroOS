"use client";

import { useState } from 'react';
import { AIModelSettings } from '@/components/ai-search/AIModelSettings';
import { WindowHeader } from '@/components/window/window-header';
import { WindowContent } from '@/components/window/window-content';
import { Window } from '@/components/window/window';
import { useAIModel } from '@/contexts/AIModelContext';
import { Settings } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function AIModelSettingsWindow() {
  const { models, updateModels } = useAIModel();
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleSave = (newModels: any[]) => {
    updateModels(newModels);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {!isMinimized && (
        <Window
          title="AI Model Settings"
          icon={<Settings className="h-5 w-5" />}
          onClose={() => setIsOpen(false)}
          defaultPosition={{ x: 100, y: 100 }}
          defaultSize={{ width: 800, height: 600 }}
          minSize={{ width: 600, height: 400 }}
          maxSize={{ width: 1200, height: 800 }}
          className={cn(
            isMaximized && "fixed inset-0 !w-full !h-full !m-0 !rounded-none"
          )}
        >
          <WindowHeader
            title="AI Model Settings"
            icon={<Settings className="h-5 w-5" />}
            onClose={() => setIsOpen(false)}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
          <WindowContent>
            <AIModelSettings
              initialModels={models}
              onSave={handleSave}
            />
          </WindowContent>
        </Window>
      )}
    </AnimatePresence>
  );
} 