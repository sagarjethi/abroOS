'use client';
import { FC } from 'react';
import { 
  MinusIcon, 
  SquareIcon, 
  Cross2Icon 
} from '@radix-ui/react-icons';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const WindowControls: FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onMinimize}
        className="p-1 hover:bg-white/10 rounded-md transition-colors"
      >
        <MinusIcon className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={onMaximize}
        className="p-1 hover:bg-white/10 rounded-md transition-colors"
      >
        <SquareIcon className="w-4 h-4 text-white" />
      </button>
      <button
        onClick={onClose}
        className="p-1 hover:bg-red-500 rounded-md transition-colors"
      >
        <Cross2Icon className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}; 