'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '../ui/alert';
import { 
  AlertCircle, 
  Check, 
  Clipboard, 
  Copy, 
  Key, 
  MessageSquare, 
  RefreshCw 
} from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  icon?: string;
}

interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  timestamp: string;
}

interface SignedMessage {
  message: string;
  signer: string;
  domainUrl: string;
  signature: string;
  sessionId: string | null;
  createdAt: string;
}

interface AccountData {
  name: string;
  balance: string;
  owner: string;
  assets: Asset[];
  transactions: Transaction[];
  signedMessages: SignedMessage[];
}

interface AccountDetailProps {
  address: string;
  className?: string;
}

export function AccountDetail({ address, className = '' }: AccountDetailProps) {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState<string>('');
  const [signerAddress, setSignerAddress] = useState<string>('');
  const [domainUrl, setDomainUrl] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSigningMessage, setIsSigningMessage] = useState<boolean>(false);
  const [signatureResult, setSignatureResult] = useState<{ signature: string; address: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchAccountData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/account/${address}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account data');
      }
      
      setAccountData(data);
      
      // If signerAddress is empty, set it to the owner address
      if (!signerAddress && data.owner) {
        setSignerAddress(data.owner);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchAccountData();
    }
  }, [address]);

  const handleSignMessage = async () => {
    if (!messageToSign || !signerAddress || !password) {
      setError('Message, signer address, and password are required');
      return;
    }
    
    setIsSigningMessage(true);
    setError(null);
    setSignatureResult(null);
    
    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSign,
          address,
          signerAddress,
          domainUrl,
          sessionId: null, // Optional: Add session ID if needed
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign message');
      }
      
      setSignatureResult(data);
      
      // Refresh account data to get updated signed messages
      fetchAccountData();
      
      // Reset form
      setMessageToSign('');
      setPassword('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSigningMessage(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !accountData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Account</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            className="mt-4" 
            onClick={fetchAccountData}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!accountData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Account Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No account found for the address: {address}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{accountData.name}</CardTitle>
            <CardDescription>
              Account Details and Operations
            </CardDescription>
          </div>
          <div>
            <p className="text-xl font-semibold">{accountData.balance}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-md">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Account Address</p>
            <p className="font-mono text-sm truncate">{address}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => copyToClipboard(address, 'address')}
          >
            {copiedText === 'address' ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Tabs defaultValue="assets">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="signMessages">Signed Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assets">
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountData.assets.map((asset) => (
                    <TableRow key={asset.symbol}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {asset.icon ? (
                            <img src={asset.icon} alt={asset.symbol} className="h-6 w-6" />
                          ) : (
                            <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs">{asset.symbol.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p>{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.symbol}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{asset.balance}</TableCell>
                      <TableCell className="text-right">{asset.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            {accountData.transactions.length === 0 ? (
              <div className="text-center p-8 border rounded-md">
                <p className="text-gray-500">No transactions found for this account.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tx Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountData.transactions.map((tx) => (
                    <TableRow key={tx.hash}>
                      <TableCell>
                        <span className={tx.type === 'receive' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'receive' ? 'Receive' : 'Send'}
                        </span>
                      </TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>{tx.timestamp}</TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]">
                        <div className="flex items-center space-x-1">
                          <span>{tx.hash}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(tx.hash, tx.hash)}
                          >
                            {copiedText === tx.hash ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="signMessages">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Sign a New Message</h3>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {signatureResult && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle>Message Signed Successfully</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Signature:</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(signatureResult.signature, 'signature')}
                          >
                            {copiedText === 'signature' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                          {signatureResult.signature}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="messageToSign">Message to Sign</Label>
                    <Textarea
                      id="messageToSign"
                      placeholder="Enter message to sign..."
                      value={messageToSign}
                      onChange={(e) => setMessageToSign(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signerAddress">Signer Address</Label>
                    <Input
                      id="signerAddress"
                      placeholder="0x..."
                      value={signerAddress}
                      onChange={(e) => setSignerAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="domainUrl">Domain URL (optional)</Label>
                    <Input
                      id="domainUrl"
                      placeholder="https://example.com"
                      value={domainUrl}
                      onChange={(e) => setDomainUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Wallet Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your wallet password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleSignMessage}
                    disabled={isSigningMessage || !messageToSign || !signerAddress || !password}
                  >
                    {isSigningMessage ? 'Signing...' : 'Sign Message'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Previously Signed Messages</h3>
                
                {accountData.signedMessages.length === 0 ? (
                  <div className="text-center p-6 border rounded-md">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No signed messages found for this account.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accountData.signedMessages.map((msg, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-4 pb-0">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium">Signed Message</CardTitle>
                            <p className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <CardDescription className="text-xs">
                            Domain: {msg.domainUrl || 'Not specified'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Message:</p>
                              <p className="text-sm p-2 bg-gray-50 rounded break-words">
                                {msg.message}
                              </p>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500 mb-1">Signature:</p>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(msg.signature, `sig-${index}`)}
                                >
                                  {copiedText === `sig-${index}` ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs font-mono p-2 bg-gray-50 rounded truncate">
                                {msg.signature}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 