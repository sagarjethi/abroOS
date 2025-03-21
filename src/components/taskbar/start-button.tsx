'use client';
import { FC } from 'react';
import { HomeIcon } from '@radix-ui/react-icons';

interface StartButtonProps {
  onClick: () => void;
}

export const StartButton: FC<StartButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-white/10 rounded-md transition-colors"
    >
      <HomeIcon className="w-6 h-6 text-white" />
    </button>
  );
}; 