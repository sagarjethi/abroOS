'use client';
import { FC } from 'react';
import { 
  SpeakerLoudIcon, 
  MobileIcon,
  BellIcon,
  DotIcon
} from '@radix-ui/react-icons';

export const SystemTray: FC = () => {
  return (
    <div className="flex items-center gap-4 px-4">
      <SpeakerLoudIcon className="h-4 w-4" />
      <DotIcon className="h-4 w-4" />
      <MobileIcon className="h-4 w-4" />
      <BellIcon className="h-4 w-4" />
    </div>
  );
}; 