"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { AIModelConfig } from '@/components/ai-search/AIModelSettings';

interface AIModelContextType {
  models: AIModelConfig[];
  updateModels: (models: AIModelConfig[]) => void;
  getEnabledModels: () => AIModelConfig[];
  getModelById: (id: string) => AIModelConfig | undefined;
}

const AIModelContext = createContext<AIModelContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-model-settings';

export function AIModelProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = useState<AIModelConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading AI model settings:', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    }
  }, [models]);

  const updateModels = (newModels: AIModelConfig[]) => {
    setModels(newModels);
  };

  const getEnabledModels = () => {
    return models.filter(model => model.isEnabled);
  };

  const getModelById = (id: string) => {
    return models.find(model => model.id === id);
  };

  return (
    <AIModelContext.Provider value={{ models, updateModels, getEnabledModels, getModelById }}>
      {children}
    </AIModelContext.Provider>
  );
}

export function useAIModel() {
  const context = useContext(AIModelContext);
  if (context === undefined) {
    throw new Error('useAIModel must be used within an AIModelProvider');
  }
  return context;
} 