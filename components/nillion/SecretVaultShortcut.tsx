"use client";

import React from 'react';
import { Database } from 'lucide-react';
import { useWindows } from '@/contexts/WindowsContext';
import { SecretVaultApp } from './SecretVaultApp';
import { cn } from '@/lib/utils';

export function SecretVaultShortcut() {
  const { openWindow, closeWindow, isWindowOpen } = useWindows();
  const alreadyOpen = isWindowOpen('secretVault');

  const handleOpenSecretVault = () => {
    if (alreadyOpen) {
      // If already open, close and reopen to refresh
      closeWindow('secretVault');
      setTimeout(() => {
        openSecretVaultWindow();
      }, 100);
    } else {
      openSecretVaultWindow();
    }
  };

  const openSecretVaultWindow = () => {
    openWindow({
      id: 'secretVault',
      title: 'Nillion SecretVault',
      content: {
        type: 'custom',
        render: ({ onClose }) => (
          <SecretVaultApp isOpen={true} onClose={() => closeWindow('secretVault')} />
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
      data-shortcut="secretVault"
      className={cn(
        "fixed bottom-4 left-4 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg cursor-pointer flex items-center justify-center",
        "hover:scale-105 transition-transform duration-200",
        "border-2 border-white/30"
      )}
      onClick={handleOpenSecretVault}
    >
      <Database className="h-7 w-7 text-white"/>
    </div>
  );
} 