"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet } from './Wallet';
import { WalletAccessorExample } from './WalletAccessorExample';
import { useWallet } from '@/contexts/WalletContext';
import { Loader2 } from 'lucide-react';

interface WalletAppProps {
  username: string;
}

export function WalletApp({ username }: WalletAppProps) {
  const { loadWallet, walletAddress, isLoading } = useWallet();
  
  useEffect(() => {
    // When the app opens, try to load the wallet for this user
    // Default password is the username for simplicity
    // In a real app, you'd want a secure password mechanism
    const initWallet = async () => {
      if (!walletAddress) {
        await loadWallet(username, username);
      }
    };
    
    initWallet();
  }, [username, loadWallet, walletAddress]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading your wallet...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full overflow-hidden">
      <Tabs defaultValue="wallet" className="h-full flex flex-col">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <div className="flex-grow overflow-auto py-4">
          <TabsContent value="wallet" className="h-full mt-0">
            <Wallet />
            
            {/* Educational note */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">About This Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  This is a multi-chain Ethereum-compatible wallet connected to various networks.
                  It uses your username as a password for simplicity. In a real application,
                  you would need to set a strong password to protect your funds.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  You can add custom tokens, add custom networks, and send transactions on any supported blockchain.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="h-full mt-0">
            <WalletAccessorExample />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 