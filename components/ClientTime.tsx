"use client";

import { useState, useEffect } from "react";

interface ClientTimeProps {
  format?: 'time' | 'date' | 'datetime' | 'custom';
  customFormat?: (date: Date) => string;
  className?: string;
}

export function ClientTime({ 
  format = 'time', 
  customFormat,
  className = "text-sm" 
}: ClientTimeProps) {
  const [displayTime, setDisplayTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      if (customFormat) {
        setDisplayTime(customFormat(now));
        return;
      }
      
      switch (format) {
        case 'time':
          setDisplayTime(now.toLocaleTimeString());
          break;
        case 'date':
          setDisplayTime(now.toLocaleDateString());
          break;
        case 'datetime':
          setDisplayTime(now.toLocaleString());
          break;
        default:
          setDisplayTime(now.toLocaleTimeString());
      }
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, [format, customFormat]);

  if (!displayTime) return null;

  return <div className={className}>{displayTime}</div>;
}