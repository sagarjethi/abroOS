"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Cpu, Bot, BrainCircuit, Clock, History as HistoryIcon, BookMarked, X, CircleSlash, PanelLeft, Loader2, Globe, FileText, LayoutDashboard, BookOpen, CircleDot, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAIModel } from '@/contexts/AIModelContext';
import { AIModelSettings, type AIModelConfig } from './AIModelSettings';

// Define the different AI modes available
export const AI_MODES = {
  ASSISTANT: 'assistant',
  RESEARCHER: 'researcher',
  CODER: 'coder',
  CREATOR: 'creator',
} as const;

export type AIMode = typeof AI_MODES[keyof typeof AI_MODES];

export interface AISearchResult {
  id: string;
  title: string;
  snippet: string;
  url?: string;
  source: string;
  timestamp?: string;
  type: 'web' | 'file' | 'app' | 'knowledge' | 'generated';
  confidence: number;
}

interface AISearchAgentProps {
  initialQuery?: string;
  initialMode?: AIMode;
  isFloating?: boolean;
  onClose?: () => void;
}

export function AISearchAgent({
  initialQuery = '',
  initialMode = AI_MODES.ASSISTANT,
  isFloating = false,
  onClose,
}: AISearchAgentProps) {
  const { models, getEnabledModels } = useAIModel();
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentMode, setCurrentMode] = useState<AIMode>(initialMode);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('results');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Generate initial AI suggestions based on mode
    generateAiSuggestions(currentMode);
  }, [currentMode]);

  // Perform search when initial query is provided
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setActiveTab('results');
    
    try {
      // Get enabled models
      const enabledModels = getEnabledModels();
      if (enabledModels.length === 0) {
        setAiAnalysis('Please enable at least one AI model in settings.');
        return;
      }

      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
        return newHistory;
      });
      
      // Generate mock results based on query and current mode
      const mockResults = generateMockResults(query, currentMode);
      setSearchResults(mockResults);
      
      // Generate AI analysis using enabled models
      generateAiAnalysis(query, currentMode, enabledModels);
      
    } finally {
      setIsSearching(false);
    }
  };

  const generateMockResults = (query: string, mode: AIMode): AISearchResult[] => {
    // Different results based on the AI mode
    const baseResults: AISearchResult[] = [
      {
        id: `result-1-${Date.now()}`,
        title: `${query} - Comprehensive Analysis`,
        snippet: `This analysis provides an in-depth look at ${query}, covering the most important aspects and recent developments.`,
        source: 'AI Knowledge Base',
        timestamp: new Date().toISOString(),
        type: 'knowledge',
        confidence: 0.96,
      },
      {
        id: `result-2-${Date.now()}`,
        title: `Understanding ${query}`,
        snippet: `An overview of ${query} with explanations of key concepts and terminology.`,
        url: 'https://example.com/understanding',
        source: 'Web Search',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: 'web',
        confidence: 0.89,
      },
    ];
    
    // Mode-specific results
    switch (mode) {
      case AI_MODES.ASSISTANT:
        return [
          ...baseResults,
          {
            id: `result-3-${Date.now()}`,
            title: `How to use ${query} efficiently`,
            snippet: `Tips and tricks for getting the most out of ${query} in your daily workflow.`,
            source: 'Assistant Knowledge',
            type: 'generated',
            confidence: 0.92,
          },
        ];
        
      case AI_MODES.RESEARCHER:
        return [
          ...baseResults,
          {
            id: `result-3-${Date.now()}`,
            title: `Latest Research on ${query}`,
            snippet: `Recent academic papers and studies related to ${query}, with summaries of key findings.`,
            source: 'Academic Database',
            timestamp: new Date(Date.now() - 604800000).toISOString(),
            type: 'knowledge',
            confidence: 0.94,
          },
          {
            id: `result-4-${Date.now()}`,
            title: `${query} Data Analysis`,
            snippet: `Statistical analysis and data visualization of trends related to ${query}.`,
            source: 'Data Repository',
            type: 'file',
            confidence: 0.87,
          },
        ];
        
      case AI_MODES.CODER:
        return [
          ...baseResults,
          {
            id: `result-3-${Date.now()}`,
            title: `${query} Code Examples`,
            snippet: `Sample code and implementation patterns for ${query} across different programming languages and frameworks.`,
            source: 'Code Repository',
            type: 'file',
            confidence: 0.93,
          },
          {
            id: `result-4-${Date.now()}`,
            title: `Implementing ${query} in TypeScript`,
            snippet: `Best practices for implementing ${query} in TypeScript with Next.js and React.`,
            source: 'Developer Documentation',
            type: 'web',
            confidence: 0.90,
          },
        ];
        
      case AI_MODES.CREATOR:
        return [
          ...baseResults,
          {
            id: `result-3-${Date.now()}`,
            title: `Creative Applications of ${query}`,
            snippet: `Innovative ways to use ${query} in creative projects and content creation.`,
            source: 'Creative Network',
            type: 'generated',
            confidence: 0.91,
          },
          {
            id: `result-4-${Date.now()}`,
            title: `Generating Content with ${query}`,
            snippet: `How to leverage ${query} for automated content creation and design workflows.`,
            source: 'Creator Tools',
            type: 'app',
            confidence: 0.89,
          },
        ];
        
      default:
        return baseResults;
    }
  };

  const generateAiSuggestions = (mode: AIMode) => {
    // Generate different suggestions based on AI mode
    switch (mode) {
      case AI_MODES.ASSISTANT:
        setAiSuggestions([
          'How to improve productivity',
          'Schedule my day efficiently',
          'Summarize my recent documents',
          'Find similar files to project proposal'
        ]);
        break;
        
      case AI_MODES.RESEARCHER:
        setAiSuggestions([
          'Latest developments in quantum computing',
          'Analyze trends in renewable energy',
          'Find academic papers on machine learning',
          'Compare data from multiple sources'
        ]);
        break;
        
      case AI_MODES.CODER:
        setAiSuggestions([
          'TypeScript pattern for state management',
          'Optimize React rendering performance',
          'Next.js App Router examples',
          'Tailwind responsive design patterns'
        ]);
        break;
        
      case AI_MODES.CREATOR:
        setAiSuggestions([
          'Generate UI design variations',
          'Create color schemes for dark mode',
          'Design system component ideas',
          'Animation patterns for micro-interactions'
        ]);
        break;
    }
  };

  const generateAiAnalysis = (query: string, mode: AIMode, enabledModels: AIModelConfig[]) => {
    // Generate analysis based on query, mode, and enabled models
    const modelNames = enabledModels.map(m => m.name).join(', ');
    
    switch (mode) {
      case AI_MODES.ASSISTANT:
        setAiAnalysis(`I've analyzed your request about "${query}" using ${modelNames}. The most important points to consider are:
        
1. The core concepts around ${query} involve several interconnected ideas
2. Recent developments have changed how we approach ${query}
3. There are practical applications you can implement immediately

Would you like me to prepare a more detailed report or summary on any specific aspect?`);
        break;
        
      case AI_MODES.RESEARCHER:
        setAiAnalysis(`My research analysis on "${query}" using ${modelNames} has yielded several interesting findings:

1. There are ${Math.floor(Math.random() * 15) + 5} recent academic papers directly addressing this topic
2. The most cited works come from researchers at MIT, Stanford, and Oxford
3. There's a significant gap in the literature regarding [specific aspect]
4. Emerging trends suggest a shift toward [new direction]

I can compile a comprehensive literature review if needed.`);
        break;
        
      case AI_MODES.CODER:
        setAiAnalysis(`I've analyzed your code-related query on "${query}" using ${modelNames} and found:

1. Several implementation patterns across different frameworks
2. Common pitfalls and performance bottlenecks to avoid
3. Best practices for TypeScript typing and organization
4. Recent API changes that might affect existing implementations

Would you like me to generate sample code or a more detailed technical specification?`);
        break;
        
      case AI_MODES.CREATOR:
        setAiAnalysis(`Your creative query about "${query}" has been analyzed by ${modelNames} and inspired several possibilities:

1. There are multiple design approaches that could work for your context
2. I've identified innovative ways to present this information visually
3. Similar creative projects have successfully used [specific technique]
4. I can generate variations based on different style guidelines

Would you like me to create a mood board or generate specific design assets?`);
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const applySuggestion = (suggestion: string) => {
    setQuery(suggestion);
    // Auto-search after a short delay
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const applyHistoryItem = (item: string) => {
    setQuery(item);
    // Auto-search after a short delay
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
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

  const getResultIcon = (type: AISearchResult['type']) => {
    switch (type) {
      case 'web':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'file':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'app':
        return <LayoutDashboard className="h-4 w-4 text-purple-500" />;
      case 'knowledge':
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case 'generated':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <CircleDot className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className={cn(
      "flex flex-col",
      isFloating ? "h-full" : "min-h-[600px] max-h-[800px]"
    )}>
      {/* Header bar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">AI Search</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {showSettings ? (
            <div className="absolute inset-0 bg-background z-10">
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">AI Model Settings</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="ml-2">Close</span>
                  </Button>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <AIModelSettings 
                    onSave={(models) => {
                      // Handle model settings save
                      console.log('Saving model settings:', models);
                    }}
                    initialModels={models}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-md"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <PanelLeft className={cn("h-4 w-4", !showSidebar && "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showSidebar ? 'Hide sidebar' : 'Show sidebar'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {isFloating && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with AI modes */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r bg-muted/30"
            >
              <div className="p-3">
                <h3 className="text-sm font-medium mb-3">AI Modes</h3>
                
                <div className="space-y-1">
                  {Object.values(AI_MODES).map((mode) => (
                    <Button
                      key={mode}
                      variant={currentMode === mode ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        currentMode === mode && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        setCurrentMode(mode);
                        generateAiSuggestions(mode);
                      }}
                    >
                      {getModeIcon(mode)}
                      <span className="ml-2 capitalize">{mode}</span>
                    </Button>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-sm font-medium mb-2">Quick Search</h3>
                <div className="space-y-1.5">
                  {aiSuggestions.map((suggestion, i) => (
                    <Button 
                      key={i} 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start h-auto py-1.5 px-2 text-xs text-left font-normal"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <span className="line-clamp-2">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search with ${currentMode} AI...`}
                className="pl-9 pr-16"
              />
              
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              <div className="absolute right-9 top-1/2 -translate-y-1/2">
                <Badge variant="outline" className="h-6 text-xs font-normal bg-primary/5">
                  {getModeIcon(currentMode)}
                  <span className="ml-1 capitalize">{currentMode}</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between mt-2">
              <div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="h-8">
                    <TabsTrigger value="results" className="text-xs" disabled={searchResults.length === 0}>
                      Results
                    </TabsTrigger>
                    <TabsTrigger value="analysis" className="text-xs" disabled={!aiAnalysis}>
                      AI Analysis
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                      History
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Button variant="default" size="sm" className="h-8" onClick={handleSearch} disabled={!query.trim() || isSearching}>
                {isSearching ? (
                  <>
                    <span className="mr-1">Searching</span>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </>
                ) : (
                  <>Search</>
                )}
              </Button>
            </div>
          </div>
          
          {/* Results area */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="results" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-3">
                    {isSearching ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Searching with {currentMode} AI...
                        </p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <SearchResultCard 
                          key={result.id} 
                          result={result} 
                          getResultIcon={getResultIcon}
                        />
                      ))
                    ) : query.trim() ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <CircleSlash className="h-8 w-8 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">No results found</p>
                        <p className="text-xs text-muted-foreground mt-1">Try a different search term or AI mode</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Search className="h-8 w-8 text-muted-foreground opacity-20 mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Enter a search query to get started
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          The current AI mode is <span className="font-medium capitalize">{currentMode}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="analysis" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <Card className="bg-primary/5 border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">AI Analysis</h3>
                        </div>
                        <div className="text-sm space-y-4">
                          {aiAnalysis.split('\n\n').map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="default">Generate Report</Button>
                          <Button size="sm" variant="outline">Follow Up</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="history" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-3">
                    <h3 className="text-sm font-medium mb-3">Recent Searches</h3>
                    {searchHistory.length > 0 ? (
                      <div className="space-y-1">
                        {searchHistory.map((item, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            className="w-full justify-start text-sm h-auto py-2"
                            onClick={() => applyHistoryItem(item)}
                          >
                            <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span className="truncate">{item}</span>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <HistoryIcon className="h-8 w-8 text-muted-foreground opacity-20 mb-4" />
                        <p className="text-sm text-muted-foreground">No search history yet</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  result: AISearchResult;
  getResultIcon: (type: AISearchResult['type']) => JSX.Element;
}

function SearchResultCard({ result, getResultIcon }: SearchResultCardProps) {
  return (
    <Card className="overflow-hidden hover:border-primary/20 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {getResultIcon(result.type)}
          <h3 className="font-medium line-clamp-1">{result.title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {result.snippet}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-5 text-[10px] px-1.5 py-0">
              {result.source}
            </Badge>
            {result.confidence > 0.9 && (
              <Badge variant="outline" className="h-5 text-[10px] px-1.5 py-0 bg-primary/10">
                <Sparkles className="h-2.5 w-2.5 mr-1" />
                High confidence
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 text-xs">Save</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">View</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 