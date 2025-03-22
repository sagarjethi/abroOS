"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { walletAccessor } from '@/lib/wallet/wallet-accessor';

/**
 * Return type for the useWalletAccessor hook
 */
interface UseWalletAccessorReturn {
  walletAddress: string | null;
  isLoading: boolean;
  isAccessorAvailable: boolean;
  accessor: typeof walletAccessor;
  connectWalletAccessor: () => Promise<void>;
  disconnectWalletAccessor: () => void;
}

/**
 * Hook for accessing the wallet accessor functionality
 * Allows components to interact with the wallet in a safe way
 */
export function useWalletAccessor(): UseWalletAccessorReturn {
  const { currentWallet, walletAddress, isLoading: isWalletLoading } = useWallet();
  const [isAccessorAvailable, setIsAccessorAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Connect the wallet accessor to the current wallet
   */
  const connectWalletAccessor = useCallback(async () => {
    if (!currentWallet || !walletAddress) {
      setIsAccessorAvailable(false);
      return;
    }

    setIsLoading(true);
    try {
      await walletAccessor.connect(currentWallet);
      setIsAccessorAvailable(true);
    } catch (error) {
      console.error('Error connecting wallet accessor:', error);
      setIsAccessorAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentWallet, walletAddress]);

  /**
   * Disconnect the wallet accessor
   */
  const disconnectWalletAccessor = useCallback(() => {
    walletAccessor.disconnect();
    setIsAccessorAvailable(false);
  }, []);

  // Connect accessor when wallet changes
  useEffect(() => {
    if (currentWallet && walletAddress && !isWalletLoading) {
      connectWalletAccessor();
    } else {
      disconnectWalletAccessor();
    }
  }, [currentWallet, walletAddress, isWalletLoading, connectWalletAccessor, disconnectWalletAccessor]);

  return {
    walletAddress,
    isLoading: isLoading || isWalletLoading,
    isAccessorAvailable,
    accessor: walletAccessor,
    connectWalletAccessor,
    disconnectWalletAccessor,
  };
} 