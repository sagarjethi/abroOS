"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Bot, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssistantGuideProps {
  currentUser?: string;
}

export function AssistantGuide({ currentUser }: AssistantGuideProps) {
  const getFirstTip = () => {
    if (currentUser) {
      return `Welcome, ${currentUser}! 👋 This is abroOs - your desktop environment.`;
    }
    return "Hi! Welcome to abroOs - your browser-based desktop environment! 👋";
  };
  
  const getTips = () => [
    getFirstTip(),
    "Drag me around by clicking and holding! ✨",
    "Double click icons to open applications!",
    "Right click on icons or the desktop for context menus.",
    "Try dragging icons to rearrange them on your desktop.",
    "Click the taskbar to access running applications.",
    "You can resize windows by dragging their edges or corners.",
    "abroOs uses localStorage to save your desktop layout.",
    "Try out the different applications like Weather, Calculator, and Text Editor!",
    "The File Explorer lets you manage a virtual file system.",
    "Windows can be minimized, maximized, or closed using the buttons in the title bar.",
    "Use the logout button in the taskbar to sign out."
  ];

  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [tips] = useState(getTips());
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-100, 0, 100], [-10, 0, 10]);

  const handleNextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
    setShowTip(true);
    setAutoAdvance(false);
  };

  const handlePrevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
    setShowTip(true);
    setAutoAdvance(false);
  };

  const positionAssistantTopRight = () => {
    const margin = 20; // Distance from edges
    x.set(window.innerWidth - 300); // Position from right
    y.set(margin); // Position from top
  };

  const checkBounds = () => {
    const currentX = x.get();
    const currentY = y.get();
    const margin = 20;
    const maxX = window.innerWidth - 300;
    const maxY = window.innerHeight - 200;

    if (currentX < margin) x.set(margin);
    if (currentX > maxX) x.set(maxX);
    if (currentY < margin) y.set(margin);
    if (currentY > maxY) y.set(maxY);
  };

  useEffect(() => {
    // Position the assistant in top right initially
    positionAssistantTopRight();
    window.addEventListener('resize', positionAssistantTopRight);
    return () => window.removeEventListener('resize', positionAssistantTopRight);
  }, []);

  useEffect(() => {
    if (isDismissed || !autoAdvance) return;

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    
    return () => clearInterval(tipInterval);
  }, [isDismissed, autoAdvance]);

  if (isDismissed) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      style={{ x, y }}
      onDragStart={() => setIsBeingDragged(true)}
      onDragEnd={() => {
        setIsBeingDragged(false);
        checkBounds();
      }}
      className="fixed z-[90] select-none"
    >
      <div className="relative flex flex-col items-center gap-2">
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="relative bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border"
              style={{ 
                maxWidth: "240px",
                transform: "translateX(40px)"
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background/80"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
              >
                <X className="h-3 w-3" />
              </Button>

              <div className="flex items-start gap-2 mb-2">
                <MessageCircle className="w-4 h-4 mt-1 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{tips[currentTip]}</p>
              </div>

              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-background/50"
                  onClick={handlePrevTip}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground font-medium">
                  {currentTip + 1}/{tips.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full hover:bg-background/50"
                  onClick={handleNextTip}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={{ rotate }}
          animate={!isBeingDragged ? {
            y: [0, -10, 0],
            rotate: [-5, 5, -5],
          } : {}}
          transition={{
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            },
            rotate: {
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }
          }}
          className="relative cursor-grab active:cursor-grabbing"
        >
          <Bot className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
}