"use client";

import { AIModelSettingsShortcut } from './AIModelSettingsShortcut';
import { ComputerTesterShortcut } from './ComputerTesterShortcut';
import { ZeroGComputeShortcut } from './ZeroGComputeShortcut';
import { SecretVaultShortcut } from '../nillion/SecretVaultShortcut';
import { cn } from '@/lib/utils';

export function Desktop() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-background to-muted overflow-hidden">
      {/* Desktop Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Desktop Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 p-4">
        <AIModelSettingsShortcut />
        <ComputerTesterShortcut />
        <ZeroGComputeShortcut />
        <SecretVaultShortcut />
      </div>

      {/* Desktop Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
      </div>
    </div>
  );
} 