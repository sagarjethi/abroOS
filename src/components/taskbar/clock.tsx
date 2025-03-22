'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Button
      variant="ghost"
      className="h-full w-20 rounded-none text-sm font-medium text-white hover:bg-white/10 flex items-center justify-center"
    >
      {format(time, 'h:mm a')}
    </Button>
  );
} 