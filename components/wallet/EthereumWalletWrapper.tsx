"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { SecureWalletService } from '@/lib/wallet/secure-wallet-service';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface EthereumWalletWrapperProps {
  children: React.ReactNode;
  autoReconnect?: boolean;
  showReconnectPrompt?: boolean;
}

export function EthereumWalletWrapper({
  children,
  autoReconnect = true,
  showReconnectPrompt = true,
}: EthereumWalletWrapperProps) {
  const { wallet, isConnected, connect, isLoading: walletLoading } = useWallet();
  const { toast } = useToast();
  const [storedCredentials, setStoredCredentials] = useState<{ username: string; password: string } | null>(null);
  const [reconnectAttempted, setReconnectAttempted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  
  const secureWallet = SecureWalletService.getInstance();
  
  // Load stored wallet credentials from local storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedCredentials = localStorage.getItem('wallet_credentials');
      if (savedCredentials) {
        const { username, password, rememberMe } = JSON.parse(savedCredentials);
        if (username && password && rememberMe) {
          setStoredCredentials({ username, password });
          
          // Show reconnect prompt if autoReconnect is disabled
          if (!autoReconnect && showReconnectPrompt && !isConnected) {
            setShowPrompt(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  }, [autoReconnect, isConnected, showReconnectPrompt]);
  
  // Auto reconnect effect
  useEffect(() => {
    if (
      autoReconnect && 
      storedCredentials && 
      !isConnected && 
      !reconnectAttempted && 
      !walletLoading &&
      secureWallet.walletExists()
    ) {
      const attemptReconnect = async () => {
        setReconnecting(true);
        try {
          const success = await connect(storedCredentials.username, storedCredentials.password);
          if (success) {
            toast({
              title: "Auto-connected",
              description: "Your wallet has been reconnected",
            });
          }
        } catch (error) {
          console.error('Auto-reconnect failed:', error);
          // Don't show an error toast here to avoid confusion
        } finally {
          setReconnecting(false);
          setReconnectAttempted(true);
        }
      };
      
      attemptReconnect();
    }
  }, [autoReconnect, connect, isConnected, reconnectAttempted, storedCredentials, toast, walletLoading]);
  
  // Handle manual reconnect from prompt
  const handleManualReconnect = useCallback(async () => {
    if (!storedCredentials) return;
    
    setReconnecting(true);
    try {
      const success = await connect(storedCredentials.username, storedCredentials.password);
      if (success) {
        setShowPrompt(false);
        toast({
          title: "Connected",
          description: "Your wallet has been reconnected",
        });
      }
    } catch (error) {
      console.error('Manual reconnect failed:', error);
      toast({
        title: "Reconnection failed",
        description: error instanceof Error ? error.message : "Failed to reconnect wallet",
        variant: "destructive",
      });
    } finally {
      setReconnecting(false);
    }
  }, [connect, storedCredentials, toast]);
  
  // Store credentials in local storage when connected
  const saveCredentials = useCallback((username: string, password: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('wallet_credentials', JSON.stringify({ username, password, rememberMe }));
    } else {
      localStorage.removeItem('wallet_credentials');
    }
  }, []);
  
  return (
    <>
      {showPrompt && !isConnected && !reconnecting && (
        <Alert className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>You have a saved wallet. Would you like to reconnect?</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowPrompt(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleManualReconnect}
                disabled={reconnecting}
              >
                {reconnecting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Reconnect'
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {children}
    </>
  );
}

// Helper hook to use with EthereumWalletWrapper
export function useWalletPersistence() {
  const saveCredentials = useCallback((username: string, password: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('wallet_credentials', JSON.stringify({ username, password, rememberMe }));
    } else {
      localStorage.removeItem('wallet_credentials');
    }
  }, []);
  
  const clearCredentials = useCallback(() => {
    localStorage.removeItem('wallet_credentials');
  }, []);
  
  return { saveCredentials, clearCredentials };
} 