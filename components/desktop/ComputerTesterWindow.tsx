"use client";

import { useState, useEffect } from 'react';
import { WindowHeader } from '@/components/window/window-header';
import { WindowContent } from '@/components/window/window-content';
import { Window } from '@/components/window/window';
import { Cpu, MessageSquare, Network, HardDrive, Activity, Key } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { zeroGCompute, type Service, type QueryResponse } from '@/lib/services/0g-compute';
import { useToast } from '@/components/ui/use-toast';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: string;
}

export function ComputerTesterWindow() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('0g-compute-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
      zeroGCompute.setApiKey(storedApiKey);
      loadServices();
    }
  }, []);

  const loadServices = async () => {
    try {
      const servicesList = await zeroGCompute.listServices();
      setServices(servicesList);
    } catch (error) {
      toast({
        title: "Error loading services",
        description: error instanceof Error ? error.message : "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const setApiKeyHandler = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('0g-compute-api-key', apiKey);
    zeroGCompute.setApiKey(apiKey);
    setIsApiKeySet(true);
    loadServices();
    toast({
      title: "API Key Set",
      description: "Successfully set API key and loaded services",
    });
  };

  const runTest = async (testName: string) => {
    if (!isApiKeySet) {
      toast({
        title: "API Key Required",
        description: "Please set your 0G Compute API key first",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      const response = await zeroGCompute.sendQuery(`Run ${testName}`);
      const result: TestResult = {
        name: testName,
        status: response.success ? 'success' : 'error',
        message: response.success ? `Test completed successfully: ${testName}` : response.error || 'Test failed',
        timestamp: new Date().toISOString(),
      };
      setTestResults(prev => [...prev, result]);
    } catch (error) {
      const result: TestResult = {
        name: testName,
        status: 'error',
        message: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date().toISOString(),
      };
      setTestResults(prev => [...prev, result]);
    } finally {
      setIsTesting(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    if (!isApiKeySet) {
      toast({
        title: "API Key Required",
        description: "Please set your 0G Compute API key first",
        variant: "destructive",
      });
      return;
    }
    
    const newMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');

    try {
      const response = await zeroGCompute.sendQuery(chatInput);
      const aiResponse = {
        role: 'assistant' as const,
        content: response.success ? response.data : response.error || 'Failed to get response',
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const aiResponse = {
        role: 'assistant' as const,
        content: error instanceof Error ? error.message : 'Failed to get response',
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {!isMinimized && (
        <Window
          title="0G Compute Tester"
          icon={<Cpu className="h-5 w-5" />}
          onClose={() => setIsOpen(false)}
          defaultPosition={{ x: 150, y: 150 }}
          defaultSize={{ width: 900, height: 600 }}
          minSize={{ width: 700, height: 400 }}
          maxSize={{ width: 1200, height: 800 }}
          className={cn(
            isMaximized && "fixed inset-0 !w-full !h-full !m-0 !rounded-none"
          )}
        >
          <WindowHeader
            title="0G Compute Tester"
            icon={<Cpu className="h-5 w-5" />}
            onClose={() => setIsOpen(false)}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
          <WindowContent>
            <Tabs defaultValue="tests" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tests">System Tests</TabsTrigger>
                <TabsTrigger value="chat">Chat Integration</TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="h-[calc(100%-40px)]">
                <ScrollArea className="h-full pr-4">
                  {/* API Key Setup */}
                  {!isApiKeySet && (
                    <Card className="mb-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Set API Key
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your 0G Compute API key"
                          />
                          <Button onClick={setApiKeyHandler}>Set Key</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-4 p-4">
                    {/* CPU Test */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          CPU Test
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => runTest('CPU Test')}
                          disabled={isTesting}
                        >
                          Run CPU Test
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Memory Test */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Memory Test
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => runTest('Memory Test')}
                          disabled={isTesting}
                        >
                          Run Memory Test
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Storage Test */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Storage Test
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => runTest('Storage Test')}
                          disabled={isTesting}
                        >
                          Run Storage Test
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Network Test */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-4 w-4" />
                          Network Test
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => runTest('Network Test')}
                          disabled={isTesting}
                        >
                          Run Network Test
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Test Results */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-2">Test Results</h3>
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                result.status === 'success'
                                  ? 'default'
                                  : result.status === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {result.status}
                            </Badge>
                            <span className="text-sm">{result.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat" className="h-[calc(100%-40px)]">
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex",
                            message.role === 'user' ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg p-3",
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                      />
                      <Button onClick={sendChatMessage}>Send</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </WindowContent>
        </Window>
      )}
    </AnimatePresence>
  );
} 