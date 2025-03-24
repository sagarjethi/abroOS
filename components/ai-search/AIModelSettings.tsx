"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Key, Shield, Info, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  isEnabled: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
  customEndpoint?: string;
  organizationId?: string;
  projectId?: string;
  region?: string;
  customHeaders?: Record<string, string>;
  fallbackModel?: string;
  retryCount?: number;
  timeout?: number;
  streamingEnabled?: boolean;
  contextWindow?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  walletAddress?: string;
  evmNetwork?: string;
  walletBalance?: string;
}

const DEFAULT_MODELS: AIModelConfig[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    apiKey: '',
    isEnabled: true,
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    customEndpoint: '',
    organizationId: '',
    projectId: '',
    region: 'us-east-1',
    customHeaders: {},
    fallbackModel: 'gpt-3.5-turbo',
    retryCount: 3,
    timeout: 30000,
    streamingEnabled: true,
    contextWindow: 8192,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'anthropic',
    apiKey: '',
    isEnabled: false,
    model: 'claude-3-opus-20240229',
    maxTokens: 4000,
    temperature: 0.7,
    customEndpoint: '',
    organizationId: '',
    projectId: '',
    region: 'us-east-1',
    customHeaders: {},
    fallbackModel: 'claude-2.1',
    retryCount: 3,
    timeout: 30000,
    streamingEnabled: true,
    contextWindow: 200000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    id: 'grok-1',
    name: 'Grok-1',
    provider: 'xai',
    apiKey: '',
    isEnabled: false,
    model: 'grok-1',
    maxTokens: 2000,
    temperature: 0.7,
    customEndpoint: '',
    organizationId: '',
    projectId: '',
    region: 'us-east-1',
    customHeaders: {},
    fallbackModel: 'grok-1-base',
    retryCount: 3,
    timeout: 30000,
    streamingEnabled: true,
    contextWindow: 8192,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    provider: 'ollama',
    apiKey: '',
    isEnabled: false,
    model: 'llama2',
    maxTokens: 2000,
    temperature: 0.7,
    customEndpoint: 'http://localhost:11434',
    organizationId: '',
    projectId: '',
    region: '',
    customHeaders: {},
    fallbackModel: 'mistral',
    retryCount: 3,
    timeout: 30000,
    streamingEnabled: true,
    contextWindow: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    id: 'nillion',
    name: 'Nillion',
    provider: 'nillion',
    apiKey: '',
    isEnabled: false,
    model: 'nillion-1',
    maxTokens: 2000,
    temperature: 0.7,
    customEndpoint: '',
    organizationId: '',
    projectId: '',
    region: 'us-east-1',
    customHeaders: {},
    fallbackModel: 'nillion-1-base',
    retryCount: 3,
    timeout: 30000,
    streamingEnabled: true,
    contextWindow: 8192,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    id: '0g-compute',
    name: '0G Compute',
    provider: '0g',
    apiKey: '',
    isEnabled: true,
    model: '0g-compute-default',
    maxTokens: 4000,
    temperature: 0.7,
    customEndpoint: 'https://api-testnet.0g.ai',
    organizationId: '',
    projectId: '',
    region: '',
    customHeaders: {},
    fallbackModel: '',
    retryCount: 3,
    timeout: 30000,
    streamingEnabled: true,
    contextWindow: 16384,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    walletAddress: '',
    evmNetwork: 'testnet',
    walletBalance: '0.0',
  },
];

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI', description: 'GPT-4, GPT-3.5, and other OpenAI models' },
  { value: 'anthropic', label: 'Anthropic', description: 'Claude 3 and Claude 2 models' },
  { value: 'xai', label: 'xAI', description: 'Grok and other xAI models' },
  { value: 'ollama', label: 'Ollama', description: 'Local LLM models like Llama 2 and Mistral' },
  { value: 'nillion', label: 'Nillion', description: 'Privacy-focused AI models' },
  { value: '0g', label: '0G Compute', description: 'Decentralized AI computation on the 0G network' },
];

interface AIModelSettingsProps {
  onSave: (models: AIModelConfig[]) => void;
  initialModels?: AIModelConfig[];
}

export function AIModelSettings({ onSave, initialModels = DEFAULT_MODELS }: AIModelSettingsProps) {
  const [models, setModels] = useState<AIModelConfig[]>(initialModels);
  const [activeTab, setActiveTab] = useState('openai');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [customHeaders, setCustomHeaders] = useState<Record<string, Record<string, string>>>({});

  const handleModelChange = (modelId: string, field: keyof AIModelConfig, value: any) => {
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, [field]: value } : model
    ));
  };

  const handleCustomHeaderChange = (modelId: string, key: string, value: string) => {
    setCustomHeaders(prev => ({
      ...prev,
      [modelId]: {
        ...prev[modelId],
        [key]: value
      }
    }));
  };

  const addCustomHeader = (modelId: string) => {
    const newKey = `header-${Object.keys(customHeaders[modelId] || {}).length + 1}`;
    handleCustomHeaderChange(modelId, newKey, '');
  };

  const removeCustomHeader = (modelId: string, key: string) => {
    setCustomHeaders(prev => ({
      ...prev,
      [modelId]: Object.fromEntries(
        Object.entries(prev[modelId] || {}).filter(([k]) => k !== key)
      )
    }));
  };

  const handleSave = () => {
    // Merge custom headers with models
    const modelsWithHeaders = models.map(model => ({
      ...model,
      customHeaders: customHeaders[model.id] || {}
    }));
    
    onSave(modelsWithHeaders);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getModelByProvider = (provider: string) => {
    return models.find(model => model.provider === provider) || DEFAULT_MODELS[0];
  };

  const toggleApiKeyVisibility = (modelId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI Model Settings
          </CardTitle>
          <CardDescription>
            Configure your AI model providers and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              {PROVIDER_OPTIONS.map(option => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {PROVIDER_OPTIONS.map(option => {
              const model = getModelByProvider(option.value);
              return (
                <TabsContent key={option.value} value={option.value}>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                      {/* Basic Settings */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Basic Settings</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor={`enabled-${model.id}`}>Enable {option.label}</Label>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          <Switch
                            id={`enabled-${model.id}`}
                            checked={model.isEnabled}
                            onCheckedChange={(checked) => handleModelChange(model.id, 'isEnabled', checked)}
                          />
                        </div>

                        {model.isEnabled && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor={`api-key-${model.id}`}>API Key</Label>
                              <div className="relative">
                                <Input
                                  id={`api-key-${model.id}`}
                                  type={showApiKey[model.id] ? "text" : "password"}
                                  value={model.apiKey}
                                  onChange={(e) => handleModelChange(model.id, 'apiKey', e.target.value)}
                                  placeholder="Enter your API key"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => toggleApiKeyVisibility(model.id)}
                                  >
                                    {showApiKey[model.id] ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyApiKey(model.apiKey)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`model-${model.id}`}>Model</Label>
                              <Input
                                id={`model-${model.id}`}
                                value={model.model}
                                onChange={(e) => handleModelChange(model.id, 'model', e.target.value)}
                                placeholder="Enter model name"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {model.isEnabled && (
                        <>
                          <Separator />
                          
                          {/* Advanced Settings */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">Advanced Settings</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`max-tokens-${model.id}`}>Max Tokens</Label>
                                <Input
                                  id={`max-tokens-${model.id}`}
                                  type="number"
                                  value={model.maxTokens}
                                  onChange={(e) => handleModelChange(model.id, 'maxTokens', parseInt(e.target.value))}
                                  min={1}
                                  max={8000}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`temperature-${model.id}`}>Temperature</Label>
                                <div className="space-y-2">
                                  <Slider
                                    id={`temperature-${model.id}`}
                                    value={[model.temperature]}
                                    onValueChange={([value]) => handleModelChange(model.id, 'temperature', value)}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Conservative (0)</span>
                                    <span>Balanced (1)</span>
                                    <span>Creative (2)</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`custom-endpoint-${model.id}`}>Custom Endpoint</Label>
                              <Input
                                id={`custom-endpoint-${model.id}`}
                                value={model.customEndpoint}
                                onChange={(e) => handleModelChange(model.id, 'customEndpoint', e.target.value)}
                                placeholder="Enter custom API endpoint"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`organization-id-${model.id}`}>Organization ID</Label>
                                <Input
                                  id={`organization-id-${model.id}`}
                                  value={model.organizationId}
                                  onChange={(e) => handleModelChange(model.id, 'organizationId', e.target.value)}
                                  placeholder="Enter organization ID"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`project-id-${model.id}`}>Project ID</Label>
                                <Input
                                  id={`project-id-${model.id}`}
                                  value={model.projectId}
                                  onChange={(e) => handleModelChange(model.id, 'projectId', e.target.value)}
                                  placeholder="Enter project ID"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`region-${model.id}`}>Region</Label>
                              <Input
                                id={`region-${model.id}`}
                                value={model.region}
                                onChange={(e) => handleModelChange(model.id, 'region', e.target.value)}
                                placeholder="Enter region (e.g., us-east-1)"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`fallback-model-${model.id}`}>Fallback Model</Label>
                              <Input
                                id={`fallback-model-${model.id}`}
                                value={model.fallbackModel}
                                onChange={(e) => handleModelChange(model.id, 'fallbackModel', e.target.value)}
                                placeholder="Enter fallback model name"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`retry-count-${model.id}`}>Retry Count</Label>
                                <Input
                                  id={`retry-count-${model.id}`}
                                  type="number"
                                  value={model.retryCount}
                                  onChange={(e) => handleModelChange(model.id, 'retryCount', parseInt(e.target.value))}
                                  min={0}
                                  max={5}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`timeout-${model.id}`}>Timeout (ms)</Label>
                                <Input
                                  id={`timeout-${model.id}`}
                                  type="number"
                                  value={model.timeout}
                                  onChange={(e) => handleModelChange(model.id, 'timeout', parseInt(e.target.value))}
                                  min={1000}
                                  max={60000}
                                  step={1000}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`streaming-${model.id}`}
                                checked={model.streamingEnabled}
                                onCheckedChange={(checked) => handleModelChange(model.id, 'streamingEnabled', checked)}
                              />
                              <Label htmlFor={`streaming-${model.id}`}>Enable Streaming</Label>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`context-window-${model.id}`}>Context Window</Label>
                              <Input
                                id={`context-window-${model.id}`}
                                type="number"
                                value={model.contextWindow}
                                onChange={(e) => handleModelChange(model.id, 'contextWindow', parseInt(e.target.value))}
                                min={1024}
                                max={32768}
                                step={1024}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`top-p-${model.id}`}>Top P</Label>
                              <div className="space-y-2">
                                <Slider
                                  id={`top-p-${model.id}`}
                                  value={[model.topP || 1]}
                                  onValueChange={([value]) => handleModelChange(model.id, 'topP', value)}
                                  min={0}
                                  max={1}
                                  step={0.1}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Diverse (0)</span>
                                  <span>Focused (1)</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`frequency-penalty-${model.id}`}>Frequency Penalty</Label>
                                <Input
                                  id={`frequency-penalty-${model.id}`}
                                  type="number"
                                  value={model.frequencyPenalty}
                                  onChange={(e) => handleModelChange(model.id, 'frequencyPenalty', parseFloat(e.target.value))}
                                  min={-2}
                                  max={2}
                                  step={0.1}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`presence-penalty-${model.id}`}>Presence Penalty</Label>
                                <Input
                                  id={`presence-penalty-${model.id}`}
                                  type="number"
                                  value={model.presencePenalty}
                                  onChange={(e) => handleModelChange(model.id, 'presencePenalty', parseFloat(e.target.value))}
                                  min={-2}
                                  max={2}
                                  step={0.1}
                                />
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Custom Headers */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">Custom Headers</h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addCustomHeader(model.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Header
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {Object.entries(customHeaders[model.id] || {}).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <Input
                                    placeholder="Header name"
                                    value={key}
                                    onChange={(e) => {
                                      const newHeaders = { ...customHeaders[model.id] };
                                      delete newHeaders[key];
                                      newHeaders[e.target.value] = value;
                                      setCustomHeaders(prev => ({
                                        ...prev,
                                        [model.id]: newHeaders
                                      }));
                                    }}
                                  />
                                  <Input
                                    placeholder="Header value"
                                    value={value}
                                    onChange={(e) => handleCustomHeaderChange(model.id, key, e.target.value)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCustomHeader(model.id, key)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              );
            })}
          </Tabs>

          {showSuccess && (
            <Alert className="mt-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Settings saved successfully!</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end mt-4">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ZeroGComputeSettings({ modelId, model, onChange }: {
  modelId: string;
  model: AIModelConfig;
  onChange: (field: keyof AIModelConfig, value: any) => void;
}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onChange('walletAddress', '0x1234...5678');
      onChange('walletBalance', '0.5');
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };
  
  return (
    <div className="space-y-6 mt-4">
      <div className="p-4 border rounded-md bg-muted/10">
        <h3 className="font-medium mb-2">0G Compute Wallet Configuration</h3>
        
        {model.walletAddress ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                <div className="font-mono text-sm">{model.walletAddress}</div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Connected
              </Badge>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Network</Label>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {model.evmNetwork === 'testnet' ? '0G Testnet' : '0G Mainnet'}
                </Badge>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Balance</Label>
              <div className="text-sm font-medium">{model.walletBalance} ETH</div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="w-full">
                Switch Network
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your wallet to use 0G Compute services
            </p>
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>Connecting Wallet</>
              ) : (
                <>Connect Wallet</>
              )}
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor={`${modelId}-endpoint`}>API Endpoint</Label>
          <Input
            id={`${modelId}-endpoint`}
            value={model.customEndpoint || ''}
            onChange={(e) => onChange('customEndpoint', e.target.value)}
            placeholder="https://api-testnet.0g.ai"
          />
          <p className="text-xs text-muted-foreground">
            The 0G Compute API endpoint to connect to
          </p>
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${modelId}-streaming`}>Enable Streaming</Label>
            <Switch
              id={`${modelId}-streaming`}
              checked={model.streamingEnabled || false}
              onCheckedChange={(checked) => onChange('streamingEnabled', checked)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Receive responses in real-time as they're generated
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor={`${modelId}-model`}>Model Selection</Label>
          <Select
            value={model.model}
            onValueChange={(value) => onChange('model', value)}
          >
            <SelectTrigger id={`${modelId}-model`}>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0g-compute-default">0G Compute Default</SelectItem>
              <SelectItem value="gpt4-0g">GPT-4 on 0G</SelectItem>
              <SelectItem value="claude-0g">Claude on 0G</SelectItem>
              <SelectItem value="mistral-0g">Mistral on 0G</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Select which AI model to use through the 0G network
          </p>
        </div>
      </div>
    </div>
  );
} 