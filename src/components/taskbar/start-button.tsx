'use client';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface StartButtonProps {
  onClick: () => void;
}

export const StartButton: FC<StartButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      onClick={onClick}
    >
      <Icons.menu className="h-5 w-5" />
    </Button>
  );
}; 