"use client";

import React, { useState } from 'react';
import { useWalletAccessor } from '@/hooks/use-wallet-accessor';
import { walletAccessor } from '@/lib/wallet/wallet-accessor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

/**
 * Example component showing how to use the wallet accessor
 * Both through the React hook and directly accessing the global instance
 */
export function WalletAccessorExample() {
  // Using the React hook (preferred in React components)
  const { 
    accessor, 
    isAccessorAvailable, 
    walletAddress, 
    isLoading 
  } = useWalletAccessor();
  
  const [message, setMessage] = useState('Hello, Ethereum!');
  const [signature, setSignature] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [method, setMethod] = useState('balanceOf');
  const [params, setParams] = useState('');
  const [result, setResult] = useState('');
  
  // Example: Sign a message using the hook accessor
  const handleSignMessage = async () => {
    if (!isAccessorAvailable) {
      toast({
        title: "Not Available",
        description: "Wallet accessor is not available",
        variant: "destructive"
      });
      return;
    }
    
    const sig = await accessor.signMessage(message);
    if (sig) {
      setSignature(sig);
      toast({
        title: "Message Signed",
        description: "The message was signed successfully"
      });
    }
  };
  
  // Example: Call a contract method using the direct walletAccessor
  // This could be called from anywhere, even outside of React components
  const handleCallContract = async () => {
    if (!walletAccessor.isConnected()) {
      toast({
        title: "Not Connected",
        description: "Wallet is not connected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Simple ERC-20 balance check ABI
      const abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ];
      
      // Parse params based on the method
      const parsedParams = params 
        ? params.split(',').map(p => p.trim()) 
        : [walletAccessor.getAddress()]; // Default to current address
      
      const data = await walletAccessor.callContractMethod(
        contractAddress,
        abi,
        method,
        parsedParams
      );
      
      setResult(data.toString());
      toast({
        title: "Contract Call Success",
        description: `Method returned: ${data.toString()}`
      });
    } catch (error) {
      console.error('Error calling contract:', error);
      setResult('Error: ' + (error as any).message);
      toast({
        title: "Contract Call Failed",
        description: "See console for details",
        variant: "destructive"
      });
    }
  };
  
  // Direct access example (would work outside React context)
  const getAddressViaDirectAccess = () => {
    return walletAccessor.getAddress() || 'Not connected';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wallet Accessor Example</CardTitle>
        <CardDescription>
          Example showing direct wallet access through the global accessor
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status section */}
        <div className="rounded-lg bg-muted p-4">
          <h3 className="text-sm font-medium mb-2">Wallet Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Hook Address:</div>
            <div className="font-mono">{walletAddress || 'Not connected'}</div>
            
            <div>Direct Access Address:</div>
            <div className="font-mono">{getAddressViaDirectAccess()}</div>
            
            <div>Network:</div>
            <div>{walletAccessor.getNetworkId()}</div>
            
            <div>Accessor Available:</div>
            <div>{isAccessorAvailable ? 'Yes' : 'No'}</div>
          </div>
        </div>
        
        <Separator />
        
        {/* Sign message section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Sign Message</h3>
          <div className="space-y-2">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSignMessage}
              disabled={!isAccessorAvailable || isLoading || !message}
            >
              Sign Message
            </Button>
            
            {signature && (
              <div className="mt-2">
                <Label>Signature</Label>
                <div className="p-2 bg-muted rounded-md mt-1 overflow-auto text-xs font-mono break-all">
                  {signature}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* Contract call section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Call Contract</h3>
          <div className="space-y-2">
            <div className="grid gap-2">
              <Label htmlFor="contractAddress">Contract Address</Label>
              <Input
                id="contractAddress"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="method">Method</Label>
                <Input
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="params">Parameters (comma separated)</Label>
                <Input
                  id="params"
                  placeholder="Default: current address"
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleCallContract}
              disabled={isLoading || !contractAddress}
            >
              Call Contract
            </Button>
            
            {result && (
              <div className="mt-2">
                <Label>Result</Label>
                <div className="p-2 bg-muted rounded-md mt-1 overflow-auto text-xs font-mono">
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        <p>
          This component demonstrates both hook-based and direct wallet access
        </p>
      </CardFooter>
    </Card>
  );
} 