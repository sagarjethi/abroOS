import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface AppIcon {
  id: string;
  title: string;
  icon: LucideIcon;
  x: number;
  y: number;
  color?: string;
  type: 'app' | 'file' | 'folder';
  isSystemApp?: boolean;
  isDesktopApp?: boolean;
}

export type WindowContent = {
  type: 'text-editor' | 'file-explorer' | 'about' | 'browser' | 'code-indexer' | 'ai-search' | 'default' | 'custom';
  content?: React.ReactNode;
  id?: string;
  icons?: AppIcon[];
  folderId?: string;
  initialQuery?: string;
  initialMode?: string;
  render?: (props: { onClose: () => void }) => React.ReactNode;
}; 