'use client';
import { FC, useState, useEffect } from 'react';

export const Clock: FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
      setDate(now.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-end px-3 py-1">
      <span className="text-white text-sm">{time}</span>
      <span className="text-white/70 text-xs">{date}</span>
    </div>
  );
}; 