'use client';
import { FC } from 'react';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

export const PowerOptions: FC = () => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-background/80 backdrop-blur-sm">
      <Button variant="ghost" className="justify-start">
        <Icons.user className="w-4 h-4 mr-2" />
        <span>Account</span>
      </Button>
      <Button variant="ghost" className="justify-start">
        <Icons.settings className="w-4 h-4 mr-2" />
        <span>Settings</span>
      </Button>
      <Button variant="ghost" className="justify-start">
        <Icons.helpCircle className="w-4 h-4 mr-2" />
        <span>Help</span>
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start gap-2"
        onClick={() => {
          // TODO: Implement shutdown
          console.log('Shutting down...');
        }}
      >
        <Icons.power className="w-4 h-4" />
        <span>Shut down</span>
      </Button>
    </div>
  );
}; 