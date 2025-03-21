'use client';
import { FC } from 'react';
import { 
  ExitIcon, 
  PersonIcon, 
  GearIcon,
  QuestionMarkCircledIcon 
} from '@radix-ui/react-icons';

export const PowerOptions: FC = () => {
  return (
    <div className="flex flex-col gap-2 p-4 bg-background/80 backdrop-blur-sm">
      <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
        <PersonIcon className="w-4 h-4" />
        <span>Account</span>
      </button>
      <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
        <GearIcon className="w-4 h-4" />
        <span>Settings</span>
      </button>
      <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
        <QuestionMarkCircledIcon className="w-4 h-4" />
        <span>Help</span>
      </button>
      <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors">
        <ExitIcon className="w-4 h-4" />
        <span>Shut down</span>
      </button>
    </div>
  );
}; 