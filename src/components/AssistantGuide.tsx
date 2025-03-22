"use client";

import { useState, useEffect } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tips = [
  "Hi! I'm Abro, your friendly assistant! 👋",
  "Welcome to AbroOS, a modern desktop experience",
  "Double click icons to open applications!",
  "More features coming soon..."
];

export function AssistantGuide() {
  const [currentTip, setCurrentTip] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  
  useEffect(() => {
    if (isDismissed) return;

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    
    return () => clearInterval(tipInterval);
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <div className="relative flex flex-col items-center gap-2">
        <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border max-w-[240px]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background/80"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>

          <div className="flex items-start gap-2 mb-2">
            <Bot className="w-4 h-4 mt-1 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">{tips[currentTip]}</p>
          </div>

          <div className="flex justify-center items-center">
            <span className="text-xs text-muted-foreground font-medium">
              {currentTip + 1}/{tips.length}
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <Bot className="w-8 h-8 text-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
} 