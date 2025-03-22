"use client";

import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ZeroGComputeWindow } from '@/components/desktop/ZeroGComputeWindow';

export function ZeroGComputeShortcut() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="group flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => setIsOpen(true)}
        data-shortcut="0gCompute"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
        </div>
        <span className="text-xs text-center">0G Compute</span>
      </div>

      <ZeroGComputeWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
} 