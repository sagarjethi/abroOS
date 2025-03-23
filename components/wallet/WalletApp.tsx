"use client";

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { WalletHeader } from './WalletHeader';
import { TokenList } from './TokenList';
import { TransactionHistory } from './TransactionHistory';
import { SendForm } from './SendForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Window } from '@/components/window/window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useChat } from 'ai/react';
import { Checkbox } from '@/components/ui/checkbox';
import { EthereumWalletWrapper, useWalletPersistence } from './EthereumWalletWrapper';

interface WalletAppProps {
  onClose: () => void;
}

// Debug logger
const debugLog = (message: string, data?: any) => {
  console.log(`[WALLET-CHAT] ${message}`, data || '');
};

export function WalletApp({ onClose }: WalletAppProps) {
  const { wallet, isConnected, connect, createWallet } = useWallet();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'create'>('connect');
  const [debugMode, setDebugMode] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { saveCredentials, clearCredentials } = useWalletPersistence();
  
  // Use the useChat hook for streaming chat
  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading, error: chatApiError } = useChat({
    api: '/api/agent',
    initialMessages: [{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your EVM wallet assistant. I can help you with managing your wallet, sending transactions, and checking balances. What would you like to do?",
    }],
    onError: (error) => {
      console.error('Chat API error:', error);
      setChatError(`Error: ${error.message || 'Unknown error'}`);
      debugLog('Chat error:', error);
    },
    onFinish: (finishedMessage: any) => {
      debugLog('Chat message completed:', finishedMessage);
      setChatError(null);
    }
  });

  // Log messages for debugging
  useEffect(() => {
    debugLog(`Chat has ${messages.length} messages`);
    if (messages.length > 0) {
      debugLog('Latest message:', messages[messages.length - 1]);
    }
    
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle connect
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setIsLoading(true);
      const success = await connect(username, password);
      
      if (success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          saveCredentials(username, password, rememberMe);
        }
        
        toast({
          title: "Connected!",
          description: "Wallet connected successfully",
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create wallet
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setIsLoading(true);
      const success = await createWallet(username, password);
      
      if (success && rememberMe) {
        // Save credentials if remember me is checked
        saveCredentials(username, password, rememberMe);
      }
      
      toast({
        title: "Wallet created!",
        description: "New wallet created and connected",
      });
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick action handler
  const handleQuickAction = (text: string) => {
    handleInputChange({ target: { value: text } } as React.ChangeEvent<HTMLInputElement>);
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
  };

  return (
    <Window 
      title="EVM Wallet" 
      onClose={onClose}
      defaultPosition={{ x: 100, y: 100 }}
      defaultSize={{ width: 800, height: 600 }}
      minSize={{ width: 780, height: 500 }}
      maxSize={{ width: 1200, height: 800 }}
      className="flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg"
    >
      <EthereumWalletWrapper>
        <div className="flex flex-1 overflow-hidden">
          {/* Wallet Section */}
          <div className="flex-1 flex flex-col min-w-[400px] border-r border-border">
            {isConnected && wallet ? (
              // Connected Wallet UI
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                <WalletHeader />
                
                <Tabs defaultValue="send" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                    <TabsTrigger value="send">Send</TabsTrigger>
                    <TabsTrigger value="tokens">Tokens</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <TabsContent value="send" className="mt-0">
                        <SendForm />
                      </TabsContent>
                      
                      <TabsContent value="tokens" className="mt-0">
                        <TokenList />
                      </TabsContent>
                      
                      <TabsContent value="history" className="mt-0">
                        <TransactionHistory />
                      </TabsContent>
                    </div>
                  </ScrollArea>
                </Tabs>
              </div>
            ) : (
              // Login/Create Wallet UI
              <div className="flex-1 p-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'connect' | 'create')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="connect">Connect</TabsTrigger>
                    <TabsTrigger value="create">Create New</TabsTrigger>
                  </TabsList>

                  <TabsContent value="connect">
                    <form onSubmit={handleConnect} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="remember-me" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading || !username || !password}
                      >
                        {isLoading ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect Wallet'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="create">
                    <form onSubmit={handleCreate} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-username">Username</Label>
                        <Input
                          id="new-username"
                          placeholder="Choose username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Choose password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="new-remember-me" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked === true)}
                        />
                        <Label htmlFor="new-remember-me" className="text-sm font-normal cursor-pointer">
                          Remember me
                        </Label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isLoading || !username || !password}
                      >
                        {isLoading ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Wallet'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="w-[350px] flex flex-col bg-muted/30">
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Wallet Assistant</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => setDebugMode(!debugMode)}
                  title="Toggle debug mode"
                >
                  <Icons.settings className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Ask about your wallet, transactions, or blockchain concepts</p>
              
              {debugMode && (
                <div className="mt-2 text-xs bg-muted/50 p-2 rounded border border-border">
                  <div className="font-medium mb-1 text-xs">Debug Information</div>
                  <div className="grid grid-cols-2 gap-1">
                    <p>Messages: {messages.length}</p>
                    <p>Loading: {isChatLoading ? 'Yes' : 'No'}</p>
                    <p className="col-span-2">Error: {chatError || chatApiError?.message || 'None'}</p>
                  </div>
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className={cn(
                    "p-3 text-sm",
                    message.role === 'user' ? "bg-primary text-primary-foreground ml-8" : "bg-muted mr-8"
                  )}>
                    {message.content}
                    {debugMode && (
                      <div className="mt-1 pt-1 border-t border-border text-xs opacity-70">
                        id: {message.id}, role: {message.role}
                      </div>
                    )}
                  </Card>
                ))}
                {isChatLoading && (
                  <Card className="bg-muted mr-8 p-3">
                    <div className="flex items-center space-x-2">
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Loading response...</span>
                    </div>
                  </Card>
                )}
                {(chatError || chatApiError) && !isChatLoading && (
                  <Card className="bg-destructive/10 text-destructive mr-8 p-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <Icons.warning className="h-4 w-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Error loading response</p>
                        <p className="text-xs mt-1">{chatError || chatApiError?.message || 'Unknown error'}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 h-7 text-xs" 
                          onClick={() => setChatError(null)}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick action buttons */}
            <div className="px-4 pt-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickAction("What's my current balance?")}
                >
                  Check Balance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickAction("Show my transaction history")}
                >
                  View History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickAction("What are gas fees?")}
                >
                  Explain Gas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleQuickAction("How can I buy ETH?")}
                >
                  Buy Crypto
                </Button>
              </div>
            </div>

            {/* Standard chat form using the useChat hook */}
            <form onSubmit={(e) => {
              debugLog('Submitting form with input:', input);
              handleSubmit(e);
            }} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your wallet..."
                  value={input}
                  onChange={(e) => {
                    debugLog('Input changed:', e.target.value);
                    handleInputChange(e);
                  }}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={isChatLoading || !input.trim()}>
                  {isChatLoading ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    'Send'
                  )}
                </Button>
              </div>
              
              {/* Connection status indicator */}
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <div className={cn(
                  "h-2 w-2 rounded-full mr-2",
                  chatError || chatApiError ? "bg-destructive" : "bg-green-500"
                )} />
                {chatError || chatApiError 
                  ? "Connection issue - Check console for details" 
                  : "Connected to wallet assistant"}
              </div>
            </form>
          </div>
        </div>
      </EthereumWalletWrapper>
    </Window>
  );
} 