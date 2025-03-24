"use client";

import { useState, useRef } from 'react';
import { Search, Sparkles, Bot, BookMarked, Cpu, BrainCircuit, Mic, MicOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AI_MODES, type AIMode } from './AISearchAgent';

interface AISearchWidgetProps {
  onSearch: (query: string, mode: AIMode) => void;
  onOpenFullSearch: () => void;
  initialMode?: AIMode;
}

export function AISearchWidget({
  onSearch,
  onOpenFullSearch,
  initialMode = AI_MODES.ASSISTANT,
}: AISearchWidgetProps) {
  const [query, setQuery] = useState('');
  const [currentMode, setCurrentMode] = useState<AIMode>(initialMode);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (query.trim()) {
      onSearch(query, currentMode);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleModeMenu = () => {
    setIsModeMenuOpen(!isModeMenuOpen);
  };

  const selectMode = (mode: AIMode) => {
    setCurrentMode(mode);
    setIsModeMenuOpen(false);
    // Focus the input after mode selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const toggleVoiceInput = () => {
    // Mock voice input for demo purposes
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice recognition after 2 seconds
      setTimeout(() => {
        setQuery('How to implement AI search in a browser OS');
        setIsListening(false);
      }, 2000);
    }
  };

  const getModeIcon = (mode: AIMode) => {
    switch (mode) {
      case AI_MODES.ASSISTANT:
        return <Bot className="h-4 w-4" />;
      case AI_MODES.RESEARCHER:
        return <BookMarked className="h-4 w-4" />;
      case AI_MODES.CODER:
        return <Cpu className="h-4 w-4" />;
      case AI_MODES.CREATOR:
        return <BrainCircuit className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-[600px] backdrop-blur-md bg-background/90 shadow-lg border">
      <div className="p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-md",
            currentMode === AI_MODES.ASSISTANT && "text-blue-500",
            currentMode === AI_MODES.RESEARCHER && "text-amber-500",
            currentMode === AI_MODES.CODER && "text-emerald-500",
            currentMode === AI_MODES.CREATOR && "text-purple-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleModeMenu();
          }}
        >
          {getModeIcon(currentMode)}
        </Button>
        
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <Input
            ref={inputRef}
            className="pl-9 pr-9 h-9 bg-background"
            placeholder={`Search with ${currentMode} AI...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              handleKeyDown(e);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                clearSearch();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-md",
            isListening && "text-red-500 animate-pulse"
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleVoiceInput();
          }}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="default"
          size="sm"
          className="h-9 px-3 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            handleSearch(e);
          }}
        >
          Search
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            onOpenFullSearch();
          }}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </Button>
      </div>
      
      {/* AI Mode Selection Menu */}
      <AnimatePresence>
        {isModeMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t"
          >
            <div className="p-2 grid grid-cols-4 gap-2">
              {Object.entries(AI_MODES).map(([key, mode]) => (
                <Button
                  key={key}
                  variant={currentMode === mode ? "secondary" : "ghost"}
                  className={cn(
                    "h-auto py-3 justify-start flex-col items-center",
                    currentMode === mode && "bg-primary/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectMode(mode);
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    {getModeIcon(mode)}
                    <span className="mt-1 text-xs capitalize">{mode}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="p-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground px-2">
                  Each mode offers different AI capabilities
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModeMenuOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
} 