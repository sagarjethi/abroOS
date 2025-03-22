"use client";

import { cn } from '@/lib/utils';

interface WindowContentProps {
  children: React.ReactNode;
  className?: string;
}

export function WindowContent({ children, className }: WindowContentProps) {
  return (
    <div className={cn("h-full overflow-auto", className)}>
      {children}
    </div>
  );
} 