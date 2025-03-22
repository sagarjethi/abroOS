'use client';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export const SystemTray: FC = () => {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Icons.wifi className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Icons.volume2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Icons.battery className="h-4 w-4" />
      </Button>
    </div>
  );
}; 