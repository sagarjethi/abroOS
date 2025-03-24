"use client";

import React from 'react';
import { Cpu } from 'lucide-react';
import { useWindows } from '@/contexts/WindowsContext';
import { ZeroGComputeWindow } from './ZeroGComputeWindow';
import { cn } from '@/lib/utils';

export function ZeroGComputeShortcut() {
  const { openWindow, closeWindow, isWindowOpen } = useWindows();
  const alreadyOpen = isWindowOpen('0gCompute');

  const handleOpenCompute = () => {
    if (alreadyOpen) {
      // If already open, close and reopen to refresh
      closeWindow('0gCompute');
      setTimeout(() => {
        openComputeWindow();
      }, 100);
    } else {
      openComputeWindow();
    }
  };

  const openComputeWindow = () => {
    openWindow({
      id: '0gCompute',
      title: '0G Compute',
      content: {
        type: 'custom',
        render: ({ onClose }) => (
          <ZeroGComputeWindow isOpen={true} onClose={() => closeWindow('0gCompute')} />
        )
      },
      x: Math.random() * 100,
      y: Math.random() * 100,
      width: 900,
      height: 600,
    });
  };

  return (
    <div
      data-shortcut="0gCompute"
      className={cn(
        "fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg cursor-pointer flex items-center justify-center",
        "hover:scale-105 transition-transform duration-200",
        "border-2 border-white/30"
      )}
      onClick={handleOpenCompute}
    >
      <Cpu className="h-7 w-7 text-white"/>
    </div>
  );
} 