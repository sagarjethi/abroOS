"use client";

import { useState, useEffect, useRef } from 'react';
import { WindowHeader } from '@/components/window/window-header';
import { WindowContent } from '@/components/window/window-content';
import { Window } from '@/components/window/window';
import { Cpu, MessageSquare, Key, Settings, Send, Loader2, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { zeroGCompute, type Service } from '@/lib/services/0g-compute';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';

interface ZeroGComputeWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
};

export function ZeroGComputeWindow({ isOpen, onClose }: ZeroGComputeWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Welcome to 0G Compute. Select a service to begin chatting.',
      timestamp: new Date(),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('0g-compute-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
      zeroGCompute.setApiKey(storedApiKey);
    }
    // Load services regardless of API key
    loadServices();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadServices = async () => {
    try {
      setIsServicesLoading(true);
      const servicesList = await zeroGCompute.listServices();
      setServices(servicesList);
      
      if (servicesList.length > 0) {
        setSelectedService(servicesList[0].id);
        
        // Add service list message
        const serviceNames = servicesList.map(s => s.name).join(', ');
        setMessages(prev => [
          ...prev,
          {
            id: `services-${Date.now()}`,
            role: 'system',
            content: `Available services: ${serviceNames}. Select one to begin.`,
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `no-services-${Date.now()}`,
            role: 'system',
            content: 'No services available. Please check your account status.',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to load services";
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'system',
          content: `Error loading services: ${errorMsg}`,
          timestamp: new Date()
        }
      ]);
      
      toast({
        title: "Error loading services",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsServicesLoading(false);
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
    
    toast({
      title: "API Key Set",
      description: "API key saved successfully",
    });
    
    // Reload services with the new API key
    loadServices();
  };

  const clearApiKey = () => {
    localStorage.removeItem('0g-compute-api-key');
    setApiKey('');
    setIsApiKeySet(false);
    
    toast({
      title: "API Key Removed",
      description: "Your API key has been cleared",
    });
    
    // Reload services with demo mode
    loadServices();
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = services.find(s => s.id === serviceId);
    
    if (service) {
      setMessages(prev => [
        ...prev,
        {
          id: `service-selected-${Date.now()}`,
          role: 'system',
          content: `Service "${service.name}" selected. ${service.description}`,
          timestamp: new Date()
        }
      ]);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    if (!selectedService) {
      toast({
        title: "Service Required",
        description: "Please select a compute service",
        variant: "destructive",
      });
      return;
    }
    
    const messageId = `msg-${Date.now()}`;
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    const pendingMessage: Message = {
      id: `response-${messageId}`,
      role: 'assistant',
      content: '...',
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, pendingMessage]);
    setIsLoading(true);
    
    try {
      const service = services.find(s => s.id === selectedService);
      if (!service || service.status !== 'active') {
        throw new Error(`Service ${service?.name || 'selected'} is not active`);
      }
      
      const response = await zeroGCompute.sendQuery(chatInput);
      
      setMessages(prev => prev.map(msg => 
        msg.id === pendingMessage.id
          ? {
              ...msg,
              content: response.success ? response.data : response.error || 'Failed to get response',
              status: response.success ? 'sent' : 'error',
            }
          : msg
      ));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response';
      
      setMessages(prev => prev.map(msg => 
        msg.id === pendingMessage.id
          ? {
              ...msg,
              content: errorMessage,
              status: 'error',
            }
          : msg
      ));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.status === 'sending') {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Computing response...</span>
        </div>
      );
    }
    
    if (message.status === 'error') {
      return (
        <div className="flex items-start space-x-2 text-destructive">
          <ShieldAlert className="h-4 w-4 mt-1 flex-shrink-0" />
          <span>{message.content}</span>
        </div>
      );
    }
    
    return message.content;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {!isMinimized && (
        <Window
          title="0G Compute"
          icon={<Cpu className="h-5 w-5" />}
          onClose={onClose}
          defaultPosition={{ x: 150, y: 150 }}
          defaultSize={{ width: 900, height: 600 }}
          minSize={{ width: 700, height: 400 }}
          maxSize={{ width: 1200, height: 800 }}
          className={cn(
            isMaximized && "fixed inset-0 !w-full !h-full !m-0 !rounded-none"
          )}
        >
          <WindowHeader
            title="0G Compute"
            icon={<Cpu className="h-5 w-5" />}
            onClose={onClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
          <WindowContent>
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[calc(100%-40px)] flex flex-col">
                {/* Service Selection */}
                <div className="p-4 border-b">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex-1 w-full">
                      <Label htmlFor="service-select" className="text-sm font-medium mb-1 block">
                        Select Service
                      </Label>
                      <Select
                        value={selectedService}
                        onValueChange={handleServiceChange}
                        disabled={isServicesLoading || services.length === 0}
                      >
                        <SelectTrigger id="service-select" className="w-full">
                          <SelectValue placeholder={isServicesLoading ? "Loading services..." : "Select a service"} />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex items-center gap-2">
                                <span>{service.name}</span>
                                <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                  {service.status}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('settings-tab')?.click()}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "flex gap-3 max-w-[85%]",
                            message.role === 'user' && "flex-row-reverse"
                          )}
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden flex items-center justify-center">
                            {message.role === 'user' ? (
                              <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center">
                                U
                              </div>
                            ) : message.role === 'system' ? (
                              <div className="bg-muted text-muted-foreground w-full h-full flex items-center justify-center">
                                <Info className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="bg-accent text-accent-foreground w-full h-full flex items-center justify-center">
                                <Cpu className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          
                          <div
                            className={cn(
                              "rounded-lg p-3 text-sm",
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : message.role === 'system'
                                ? "bg-muted text-muted-foreground border"
                                : "bg-accent/50 border"
                            )}
                          >
                            {renderMessageContent(message)}
                            <div className="text-xs opacity-70 mt-1 text-right">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        !selectedService 
                          ? "Please select a service" 
                          : "Type your message..."
                      }
                      disabled={!selectedService || isLoading}
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendChatMessage}
                      disabled={!selectedService || !chatInput.trim() || isLoading}
                      className="px-3"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent id="settings-tab" value="settings" className="h-[calc(100%-40px)]">
                <ScrollArea className="h-full pr-4">
                  <div className="p-4 space-y-6">
                    {/* API Key Setup */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          API Key Settings
                        </CardTitle>
                        <CardDescription>
                          API key is optional. The system works in demo mode without an API key.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-key">API Key (Optional)</Label>
                            <div className="flex gap-2">
                              <Input
                                id="api-key"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key (optional)"
                                className="flex-1"
                              />
                              <Button onClick={setApiKeyHandler} disabled={!apiKey.trim()}>
                                {isApiKeySet ? "Update" : "Save"}
                              </Button>
                            </div>
                          </div>
                          
                          {isApiKeySet ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                                <CheckCircle className="h-4 w-4" />
                                <span>API key is set</span>
                              </div>
                              <Button variant="destructive" size="sm" onClick={clearApiKey}>
                                Clear API Key
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Info className="h-4 w-4" />
                              <span>Running in demo mode - no API key required</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Services */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          Available Services
                        </CardTitle>
                        <CardDescription>
                          List of compute services available
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isServicesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : services.length > 0 ? (
                          <div className="space-y-4">
                            {services.map((service) => (
                              <div key={service.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{service.name}</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {service.description}
                                    </p>
                                  </div>
                                  <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                    {service.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No services available</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={loadServices}>
                          Refresh Services
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </WindowContent>
        </Window>
      )}
    </AnimatePresence>
  );
} 