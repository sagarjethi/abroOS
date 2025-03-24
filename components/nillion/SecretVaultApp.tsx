"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { secretVaultService } from '@/lib/nillion/secret-vault-service';
import { CheckCircle, Database, Key, ShieldCheck, Loader2 } from 'lucide-react';
import { WindowHeader } from '@/components/window/window-header';
import { WindowContent } from '@/components/window/window-content';
import { Window } from '@/components/window/window';
import { useToast } from '@/components/ui/use-toast';

interface SecretVaultAppProps {
  isOpen: boolean;
  onClose: () => void;
}

type SurveyResponse = {
  _id: string;
  years_in_web3: number;
  responses: Array<{
    rating: number;
    question_number: number;
  }>;
};

export function SecretVaultApp({ isOpen, onClose }: SecretVaultAppProps) {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [years, setYears] = useState<number>(3);
  const [rating1, setRating1] = useState<number>(3);
  const [rating2, setRating2] = useState<number>(3);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const initialize = async () => {
        try {
          // Initialize the service
          await secretVaultService.initialize();
          
          // Check if we have a schema ID
          let currentSchemaId = secretVaultService.getSchemaId();
          
          if (!currentSchemaId) {
            // Create a demo collection
            currentSchemaId = await secretVaultService.createDemoSurveyCollection();
            setSchemaId(currentSchemaId);
            
            // Add demo data
            await secretVaultService.addDemoSurveyData(currentSchemaId);
            toast({
              title: "Demo Collection Created",
              description: "A demo survey collection has been created with sample data.",
            });
          } else {
            setSchemaId(currentSchemaId);
          }
          
          // Fetch data
          await fetchSurveyResponses(currentSchemaId);
        } catch (error) {
          console.error("Failed to initialize SecretVault:", error);
          toast({
            title: "Initialization Error",
            description: "Failed to initialize the SecretVault service.",
            variant: "destructive",
          });
        }
      };
      
      initialize();
    }
  }, [isOpen, isMinimized]);

  const fetchSurveyResponses = async (id: string) => {
    setIsLoading(true);
    try {
      const responses = await secretVaultService.readRecords(id);
      setSurveyResponses(responses as SurveyResponse[]);
      setDataFetched(true);
    } catch (error) {
      console.error("Failed to fetch survey responses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch survey responses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSurveyResponse = async () => {
    if (!schemaId) return;
    
    setIsLoading(true);
    try {
      const newResponse = {
        years_in_web3: { '%allot': years },
        responses: [
          { rating: rating1, question_number: 1 },
          { rating: rating2, question_number: 2 },
        ],
      };
      
      await secretVaultService.writeRecords(schemaId, [newResponse]);
      
      toast({
        title: "Success",
        description: "Survey response added successfully.",
      });
      
      // Refresh data
      await fetchSurveyResponses(schemaId);
    } catch (error) {
      console.error("Failed to add survey response:", error);
      toast({
        title: "Error",
        description: "Failed to add survey response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };
  
  if (!isOpen) return null;
  
  return (
    <Window
      title="Nillion SecretVault"
      icon={<Database className="h-5 w-5" />}
      onClose={onClose}
      defaultPosition={{ x: 100, y: 100 }}
      defaultSize={{ width: 800, height: 600 }}
      minSize={{ width: 600, height: 400 }}
      maxSize={{ width: 1200, height: 800 }}
      className={isMaximized ? "fixed inset-0 !w-full !h-full !m-0 !rounded-none" : ""}
    >
      <WindowHeader
        title="Nillion SecretVault"
        icon={<Database className="h-5 w-5" />}
        onClose={onClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
      />
      
      <WindowContent>
        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="add">Add Survey Response</TabsTrigger>
            <TabsTrigger value="responses">View Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="h-[calc(100%-40px)]">
            <ScrollArea className="h-full pr-4">
              <div className="p-4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Nillion SecretVault
                    </CardTitle>
                    <CardDescription>
                      Store sensitive data securely by encrypting and splitting it across multiple nodes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      SecretVault lets you store sensitive data securely by encrypting and splitting it across
                      multiple nodes. While regular fields remain readable, private information is protected
                      through encryption - making it perfect for applications that need to balance data
                      accessibility with privacy.
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <h3 className="text-lg font-medium">Current Status</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-2 py-1">
                          Demo Mode
                        </Badge>
                        <Badge variant="secondary" className="px-2 py-1">
                          Web3 Survey Collection
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <h3 className="text-lg font-medium">How It Works</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Sensitive Data Protection</h4>
                            <p className="text-sm text-muted-foreground">
                              Years in Web3 are encrypted and split across multiple nodes, keeping this
                              information private.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                            <Database className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Decentralized Storage</h4>
                            <p className="text-sm text-muted-foreground">
                              Data is split into shares and distributed across multiple nodes in the network.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                            <Key className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Secure Access</h4>
                            <p className="text-sm text-muted-foreground">
                              Only authorized organizations can access and recombine encrypted data shares.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => document.getElementById('add-tab')?.click()} className="w-full">
                      Add New Survey Response
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent id="add-tab" value="add" className="h-[calc(100%-40px)]">
            <div className="p-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Survey Response</CardTitle>
                  <CardDescription>
                    Submit a new Web3 experience survey response. Your years in Web3 will be encrypted.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="years">Years in Web3 (Will be encrypted)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="years"
                          type="number"
                          min={0}
                          max={20}
                          value={years}
                          onChange={(e) => setYears(parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                        <Badge variant="outline" className="flex-shrink-0">
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Encrypted
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Survey Questions</Label>
                      <div className="bg-muted/50 rounded-md p-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="rating1">
                            Question 1: How would you rate your experience with Web3 technologies? (1-5)
                          </Label>
                          <Input
                            id="rating1"
                            type="number"
                            min={1}
                            max={5}
                            value={rating1}
                            onChange={(e) => setRating1(parseInt(e.target.value) || 3)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="rating2">
                            Question 2: How likely are you to recommend Web3 to others? (1-5)
                          </Label>
                          <Input
                            id="rating2"
                            type="number"
                            min={1}
                            max={5}
                            value={rating2}
                            onChange={(e) => setRating2(parseInt(e.target.value) || 3)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAddSurveyResponse} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Encrypting and Submitting...
                      </>
                    ) : (
                      "Submit Survey Response"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="responses" className="h-[calc(100%-40px)]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Survey Responses</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => schemaId && fetchSurveyResponses(schemaId)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
              
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading survey responses...</p>
                  </div>
                </div>
              ) : surveyResponses.length > 0 ? (
                <div className="space-y-4">
                  {surveyResponses.map((response) => (
                    <Card key={response._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Response ID: {response._id.slice(0, 8)}...</CardTitle>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Decrypted
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">Years in Web3:</div>
                            <div className="flex items-center gap-1">
                              <span>{response.years_in_web3}</span>
                              <Badge variant="secondary" className="h-5 px-1 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Decrypted
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <div className="font-medium mb-2">Survey Responses:</div>
                            <div className="grid grid-cols-2 gap-2">
                              {response.responses.map((item) => (
                                <div
                                  key={item.question_number}
                                  className="bg-muted/50 p-2 rounded flex items-center justify-between"
                                >
                                  <span>Question {item.question_number}:</span>
                                  <Badge>{item.rating}/5</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : dataFetched ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">No survey responses found.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('add-tab')?.click()}
                      className="mt-2"
                    >
                      Add Response
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Failed to fetch responses.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => schemaId && fetchSurveyResponses(schemaId)}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </WindowContent>
    </Window>
  );
} 