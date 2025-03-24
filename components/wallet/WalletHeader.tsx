"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { NETWORKS } from "@/lib/wallet/wallet-service";
import { Icons } from '@/components/icons';
import { ethers } from 'ethers';
import { useWalletPersistence } from './EthereumWalletWrapper';

export function WalletHeader() {
  const { wallet, network, switchNetwork, disconnect, formatAddress } = useWallet();
  const { toast } = useToast();
  const [balance, setBalance] = useState('0');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { clearCredentials } = useWalletPersistence();

  // Load and refresh balance
  useEffect(() => {
    const loadBalance = async () => {
      if (!wallet) return;
      try {
        const balance = await wallet.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error('Error loading balance:', error);
      }
    };

    loadBalance();
    const interval = setInterval(loadBalance, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [wallet, network]);

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!wallet?.address) return;
    
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast({
        title: "Address copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Handle network change
  const handleNetworkChange = async (networkId: string) => {
    try {
      setIsLoading(true);
      await switchNetwork(networkId);
      toast({
        title: "Network changed",
        description: `Switched to ${NETWORKS[networkId].name}`,
      });
    } catch (error) {
      toast({
        title: "Network switch failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    // Clear saved credentials
    clearCredentials();
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

  if (!wallet) return null;

  return (
    <div className="p-4 border-b space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Network and Balance Row */}
      <div className="flex items-center justify-between">
        <Select
          value={network}
          onValueChange={handleNetworkChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(NETWORKS).map(([id, config]) => (
              <SelectItem key={id} value={id}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-destructive"
        >
          Disconnect
        </Button>
      </div>

      {/* Address and Balance Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {formatAddress(wallet.address)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyAddress}
            className="h-8 w-8 hover:text-primary"
          >
            {copied ? (
              <Icons.check className="h-4 w-4" />
            ) : (
              <Icons.copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Balance</div>
          <div className="font-medium">
            {isLoading ? (
              <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
              `${balance} ${NETWORKS[network].symbol}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 