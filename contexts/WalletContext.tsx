"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { evmWalletService, NETWORKS } from '@/lib/wallet/wallet-service';
import { SecureWalletService } from '@/lib/wallet/secure-wallet-service';
import { NetworkConfig } from '@/lib/wallet/wallet-service';
import { toast } from '@/hooks/use-toast';
import { useToast } from '@/components/ui/use-toast';
import { walletAccessor } from '@/lib/wallet/wallet-accessor';

export interface WalletContextType {
  // Wallet state
  wallet: ethers.Wallet | null;
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  walletExists: boolean;
  
  // Network state
  currentNetwork: NetworkConfig;
  availableNetworks: Record<string, NetworkConfig>;
  customNetworks: Record<string, NetworkConfig>;
  network: string;
  
  // Wallet operations
  connect: (username: string, password: string) => Promise<boolean>;
  createWallet: (username: string, password: string) => Promise<boolean>;
  disconnect: () => void;
  clearWallet: () => Promise<boolean>;
  loadWallet: (username: string, password: string) => Promise<boolean>;
  
  // Network operations
  setNetwork: (networkId: string) => void;
  addCustomNetwork: (id: string, config: NetworkConfig) => boolean;
  removeCustomNetwork: (id: string) => boolean;
  
  // Transaction operations
  sendNativeCurrency: (toAddress: string, amount: string) => Promise<ethers.providers.TransactionResponse | null>;
  sendToken: (tokenAddress: string, toAddress: string, amount: string) => Promise<ethers.providers.TransactionResponse | null>;
  getNativeBalance: (address?: string) => Promise<string>;
  getTokenBalance: (tokenAddress: string, address?: string) => Promise<string>;
  
  // Signing operations
  signMessage: (message: string) => Promise<string | null>;
  signTypedData: (domain: any, types: any, value: any) => Promise<string | null>;
  
  // Contract operations
  callContractMethod: (contractAddress: string, abi: any[], method: string, params?: any[]) => Promise<any>;
  executeContractMethod: (contractAddress: string, abi: any[], method: string, params?: any[], value?: ethers.BigNumberish) => Promise<ethers.providers.TransactionResponse | null>;
  
  // Utility functions
  getExplorerUrl: (hashOrAddress: string, type?: 'address' | 'tx') => string;
  formatAddress: (address: string) => string;
  
  // New properties
  switchNetwork: (networkId: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Get secure wallet service instance
  const secureWallet = SecureWalletService.getInstance();
  
  // Wallet state
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletExists, setWalletExists] = useState(false);
  
  // Get current network and available networks
  const currentNetwork = evmWalletService.getCurrentNetwork();
  const availableNetworks = evmWalletService.getAvailableNetworks();
  const customNetworks = evmWalletService.getCustomNetworks();
  
  // Network state
  const [network, setNetworkState] = useState<string>('sepolia');
  
  const { toast } = useToast();
  
  // Check if wallet exists on initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const exists = secureWallet.walletExists();
    setWalletExists(exists);
  }, []);
  
  // Connect wallet using stored credentials
  const connect = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      let walletAddress: string;
      
      if (secureWallet.walletExists()) {
        walletAddress = await secureWallet.loadWallet(password);
      } else {
        walletAddress = await secureWallet.generateWallet(password);
      }
      
      const connectedWallet = secureWallet.getWallet();
      if (connectedWallet) {
        // Connect to current network
        const provider = evmWalletService.getProvider();
        const networkWallet = connectedWallet.connect(provider);
        
        setWallet(networkWallet);
        setAddress(walletAddress);
        setIsConnected(true);
        setWalletExists(true);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to address ${formatAddress(walletAddress)}`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create new wallet
  const createWallet = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const walletAddress = await secureWallet.generateWallet(password);
      const newWallet = secureWallet.getWallet();
      
      if (newWallet) {
        // Connect to current network
        const provider = evmWalletService.getProvider();
        const networkWallet = newWallet.connect(provider);
        
        setWallet(networkWallet);
        setAddress(walletAddress);
        setIsConnected(true);
        setWalletExists(true);
        
        toast({
          title: "Wallet Created",
          description: `New wallet created with address ${formatAddress(walletAddress)}`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create wallet",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnect = () => {
    secureWallet.lockWallet();
    setWallet(null);
    setAddress(null);
    setIsConnected(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been locked",
    });
  };
  
  // Clear wallet data
  const clearWallet = async (): Promise<boolean> => {
    try {
      secureWallet.clearWallet();
      disconnect();
      setWalletExists(false);
      
      toast({
        title: "Wallet Cleared",
        description: "Your wallet data has been removed from this browser",
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing wallet:', error);
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear wallet",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Network operations
  const setNetwork = (networkId: string) => {
    evmWalletService.setNetwork(networkId);
    
    // Reconnect wallet to new network if connected
    if (wallet && isConnected) {
      const provider = evmWalletService.getProvider();
      const networkWallet = wallet.connect(provider);
      setWallet(networkWallet);
    }
  };
  
  const addCustomNetwork = (id: string, config: NetworkConfig): boolean => {
    return evmWalletService.addCustomNetwork(id, config);
  };
  
  const removeCustomNetwork = (id: string): boolean => {
    return evmWalletService.removeCustomNetwork(id);
  };
  
  // Transaction operations
  const sendNativeCurrency = async (toAddress: string, amount: string): Promise<ethers.providers.TransactionResponse | null> => {
    if (!wallet) return null;
    
    const tx = {
      to: toAddress,
      value: ethers.utils.parseEther(amount)
    };
    
    return wallet.sendTransaction(tx);
  };
  
  const sendToken = async (tokenAddress: string, toAddress: string, amount: string): Promise<ethers.providers.TransactionResponse | null> => {
    if (!wallet) return null;
    
    const contract = new ethers.Contract(tokenAddress, [
      "function transfer(address to, uint amount) returns (bool)"
    ], wallet);
    
    return contract.transfer(toAddress, amount);
  };
  
  const getNativeBalance = async (address?: string): Promise<string> => {
    const provider = evmWalletService.getProvider();
    const balance = await provider.getBalance(address || wallet?.address || '');
    return ethers.utils.formatEther(balance);
  };
  
  const getTokenBalance = async (tokenAddress: string, address?: string): Promise<string> => {
    const provider = evmWalletService.getProvider();
    const contract = new ethers.Contract(tokenAddress, [
      "function balanceOf(address owner) view returns (uint256)"
    ], provider);
    
    const balance = await contract.balanceOf(address || wallet?.address || '');
    return balance.toString();
  };
  
  // Signing operations
  const signMessage = async (message: string): Promise<string | null> => {
    if (!wallet) return null;
    return wallet.signMessage(message);
  };
  
  const signTypedData = async (domain: any, types: any, value: any): Promise<string | null> => {
    if (!wallet) return null;
    return wallet._signTypedData(domain, types, value);
  };
  
  // Contract operations
  const callContractMethod = async (
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = []
  ): Promise<any> => {
    const provider = evmWalletService.getProvider();
    const contract = new ethers.Contract(contractAddress, abi, provider);
    return contract[method](...params);
  };
  
  const executeContractMethod = async (
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[] = [],
    value: ethers.BigNumberish = 0
  ): Promise<ethers.providers.TransactionResponse | null> => {
    if (!wallet) return null;
    
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    return contract[method](...params, { value });
  };
  
  // Utility functions
  const getExplorerUrl = (hashOrAddress: string, type: 'address' | 'tx' = 'address'): string => {
    const network = evmWalletService.getCurrentNetwork();
    return `${network.blockExplorerUrl}/${type}/${hashOrAddress}`;
  };
  
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // New properties
  const switchNetwork = async (networkId: string) => {
    try {
      if (!NETWORKS[networkId]) {
        throw new Error('Invalid network');
      }

      const success = evmWalletService.setNetwork(networkId);
      if (!success) {
        throw new Error('Failed to switch network');
      }

      setNetworkState(networkId);

      // Reconnect wallet to new network if connected
      if (wallet) {
        const provider = evmWalletService.getProvider();
        setWallet(wallet.connect(provider));
      }
    } catch (error) {
      toast({
        title: "Network switch failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const loadWallet = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const walletAddress = await secureWallet.loadWallet(password);
      const connectedWallet = secureWallet.getWallet();
      
      if (connectedWallet) {
        // Connect to current network
        const provider = evmWalletService.getProvider();
        const networkWallet = connectedWallet.connect(provider);
        
        setWallet(networkWallet);
        setAddress(walletAddress);
        setIsConnected(true);
        setWalletExists(true);
        
        toast({
          title: "Wallet Loaded",
          description: `Wallet loaded with address ${formatAddress(walletAddress)}`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast({
        title: "Loading Failed",
        description: error instanceof Error ? error.message : "Failed to load wallet",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    // Wallet state
    wallet,
    address,
    isConnected,
    isLoading,
    walletExists,
    
    // Network state
    currentNetwork,
    availableNetworks,
    customNetworks,
    network,
    
    // Wallet operations
    connect,
    createWallet,
    disconnect,
    clearWallet,
    loadWallet,
    
    // Network operations
    setNetwork,
    addCustomNetwork,
    removeCustomNetwork,
    
    // Transaction operations
    sendNativeCurrency,
    sendToken,
    getNativeBalance,
    getTokenBalance,
    
    // Signing operations
    signMessage,
    signTypedData,
    
    // Contract operations
    callContractMethod,
    executeContractMethod,
    
    // Utility functions
    getExplorerUrl,
    formatAddress,
    
    // New properties
    switchNetwork,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 