"use client";

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Loader2, HardDrive, WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZeroGFiles } from '@/components/ZeroGFiles';
import { Badge } from '@/components/ui/badge';

interface ZeroGFileAppProps {
  username: string;
}

export function ZeroGFileApp({ username }: ZeroGFileAppProps) {
  const { loadWallet, address: walletAddress, isLoading, formatAddress } = useWallet();
  const [walletConnected, setWalletConnected] = useState(false);
  
  useEffect(() => {
    // When the app opens, try to load the wallet for this user
    const initWallet = async () => {
      if (!walletAddress) {
        const success = await loadWallet(username, username);
        setWalletConnected(success);
      } else {
        setWalletConnected(true);
      }
    };
    
    initWallet();
  }, [username, loadWallet, walletAddress]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Loading wallet for 0G Storage...</p>
      </div>
    );
  }
  
  if (!walletConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="flex items-center space-x-2 mb-4">
          <HardDrive className="h-12 w-12 text-primary" />
          <WalletIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Wallet Required</h2>
        <p className="text-center text-muted-foreground mb-4">
          0G Storage requires a wallet to authenticate and sign your file operations.
        </p>
        <Button 
          onClick={async () => {
            const success = await loadWallet(username, username);
            setWalletConnected(success);
          }}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <div className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">0G Testnet Storage</h3>
          <Badge variant="outline" className="bg-blue-100 text-xs">
            Testnet
          </Badge>
        </div>
        <div className="flex items-center text-xs">
          <WalletIcon className="h-3 w-3 mr-1 text-green-500" />
          <span className="font-medium">{walletAddress ? formatAddress(walletAddress) : ''}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ZeroGFiles title="My 0G Testnet Files" />
      </div>
      
      <Card className="mt-2">
        <CardHeader className="py-2">
          <CardTitle className="text-sm">About 0G Testnet</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-xs text-muted-foreground">
            0G Testnet is a decentralized storage network for testing purposes.
            Files are stored on the 0G Testnet chain (ChainID: 16600) using A0GI 
            tokens. This test environment allows you to experiment with 
            decentralized storage without using real assets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 