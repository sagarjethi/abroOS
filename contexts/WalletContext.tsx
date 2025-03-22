"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { walletService, NetworkConfig, NETWORKS } from '@/lib/wallet/wallet-service';
import { walletStorage, UserWalletData } from '@/lib/wallet/wallet-storage';
import { tokenService, TokenConfig, TokenWithBalance } from '@/lib/wallet/token-service';
import { 
  transactionService, 
  TransactionRecord, 
  TransactionStatus, 
  TransactionType 
} from '@/lib/wallet/transaction-service';
import { walletAccessor } from '@/lib/wallet/wallet-accessor';
import { toast } from '@/hooks/use-toast';

// Interface for the wallet context
interface WalletContextProps {
  // State
  currentWallet: ethers.Wallet | null;
  walletAddress: string | null;
  walletBalance: string;
  isLoading: boolean;
  tokens: TokenWithBalance[];
  transactions: TransactionRecord[];
  currentNetwork: NetworkConfig;
  availableNetworks: Record<string, NetworkConfig>;
  customNetworks: Record<string, NetworkConfig>;
  
  // User actions
  createWallet: (username: string, password: string) => Promise<boolean>;
  loadWallet: (username: string, password: string) => Promise<boolean>;
  sendTransaction: (toAddress: string, amount: string) => Promise<boolean>;
  sendToken: (tokenAddress: string, toAddress: string, amount: string) => Promise<boolean>;
  disconnectWallet: () => void;
  switchNetwork: (networkId: string) => Promise<boolean>;
  addCustomToken: (tokenAddress: string) => Promise<boolean>;
  addCustomNetwork: (id: string, networkConfig: NetworkConfig) => Promise<boolean>;
  removeCustomNetwork: (id: string) => Promise<boolean>;
  
  // Utility functions
  formatAddress: (address: string) => string;
  refreshBalance: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  getExplorerUrl: (hashOrAddress: string, type: 'address' | 'tx') => string;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // State
  const [currentWallet, setCurrentWallet] = useState<ethers.Wallet | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokens, setTokens] = useState<TokenWithBalance[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [userCustomTokens, setUserCustomTokens] = useState<TokenConfig[]>([]);
  
  // Get current network and available networks
  const currentNetwork = walletService.getCurrentNetwork();
  const availableNetworks = walletService.getAvailableNetworks();
  
  // Get custom networks
  const customNetworks = walletService.getCustomNetworks();
  
  // Initialize services
  useEffect(() => {
    const initServices = async () => {
      await transactionService.init();
    };
    initServices();
  }, []);
  
  // Update balance when wallet changes or network changes
  useEffect(() => {
    if (walletAddress) {
      refreshBalance();
      refreshTokens();
      refreshTransactions();
      
      // Set up a timer to refresh the balance periodically
      const timer = setInterval(() => {
        refreshBalance();
        refreshTransactions();
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(timer);
    }
  }, [walletAddress, currentNetwork.name]);
  
  // Update the wallet accessor whenever the current wallet changes
  useEffect(() => {
    walletAccessor.setWallet(currentWallet);
  }, [currentWallet]);
  
  // Create a new wallet
  const createWallet = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if wallet already exists for this user
      const hasExistingWallet = await walletStorage.hasWallet(username);
      if (hasExistingWallet) {
        toast({
          title: "Wallet Already Exists",
          description: "A wallet is already associated with this user",
          variant: "destructive"
        });
        return false;
      }
      
      // Create new wallet
      const newWallet = walletService.createWallet();
      
      // Encrypt wallet data with password
      const encryptedWallet = walletService.encryptWallet(newWallet, password);
      
      // Store wallet data
      const walletData: UserWalletData = {
        encryptedWallet,
        address: newWallet.address,
        username,
        lastAccessed: Date.now()
      };
      
      const storeResult = await walletStorage.storeWallet(walletData);
      
      if (storeResult.success) {
        setCurrentWallet(newWallet);
        setWalletAddress(newWallet.address);
        await refreshBalance();
        await refreshTokens();
        await refreshTransactions();
        
        // Set wallet in the global accessor
        walletAccessor.setWallet(newWallet);
        
        toast({
          title: "Wallet Created",
          description: "Your new wallet has been created successfully"
        });
        
        return true;
      } else {
        toast({
          title: "Creation Failed",
          description: "Failed to store wallet data",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: "Creation Failed",
        description: "An error occurred while creating your wallet",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load existing wallet
  const loadWallet = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get stored wallet data
      const getResult = await walletStorage.getWallet(username);
      
      if (!getResult.success || !getResult.data) {
        // No wallet found, create a new one
        return createWallet(username, password);
      }
      
      const walletData = getResult.data;
      
      // Decrypt wallet
      const wallet = walletService.decryptWallet(walletData.encryptedWallet, password);
      
      if (!wallet) {
        toast({
          title: "Access Failed",
          description: "Could not access the wallet. Please check your password.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update last accessed time
      walletData.lastAccessed = Date.now();
      await walletStorage.updateWallet(walletData);
      
      // Set wallet state
      setCurrentWallet(wallet);
      setWalletAddress(wallet.address);
      await refreshBalance();
      await refreshTokens();
      await refreshTransactions();
      
      // Set wallet in the global accessor
      walletAccessor.setWallet(wallet);
      
      return true;
    } catch (error) {
      console.error('Error loading wallet:', error);
      toast({
        title: "Access Failed",
        description: "An error occurred while accessing your wallet",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh wallet balance
  const refreshBalance = async (): Promise<void> => {
    if (!walletAddress) return;
    
    try {
      const balance = await walletService.getBalance(walletAddress);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };
  
  // Refresh tokens
  const refreshTokens = async (): Promise<void> => {
    if (!walletAddress) return;
    
    try {
      // Get network tokens
      const networkTokens = tokenService.getNetworkTokens(walletService.getCurrentNetworkId());
      
      // Combine with custom tokens
      const allTokens = [...networkTokens, ...userCustomTokens];
      
      // Get token balances
      const tokensWithBalances = await tokenService.getAllTokenBalances(walletAddress, allTokens);
      setTokens(tokensWithBalances);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };
  
  // Refresh transactions
  const refreshTransactions = async (): Promise<void> => {
    if (!walletAddress) return;
    
    try {
      const networkId = walletService.getCurrentNetworkId();
      const txs = await transactionService.getTransactionsByAddress(walletAddress, {
        networkId,
        limit: 20
      });
      setTransactions(txs);
      
      // Check pending transactions
      for (const tx of txs.filter(t => t.status === TransactionStatus.PENDING)) {
        try {
          const provider = walletService.getProvider();
          const receipt = await provider.getTransactionReceipt(tx.hash);
          
          if (receipt) {
            const status = receipt.status ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED;
            await transactionService.updateTransactionStatus(tx.id, status, {
              blockNumber: receipt.blockNumber,
              confirmations: 1 // Will be updated later
            });
          }
        } catch (error) {
          console.error(`Error checking transaction ${tx.hash}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  
  // Switch network
  const switchNetwork = async (networkId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate network
      if (!NETWORKS[networkId]) {
        toast({
          title: "Network Error",
          description: `Network ${networkId} is not supported`,
          variant: "destructive"
        });
        return false;
      }
      
      // Set network
      walletService.setNetwork(networkId);
      
      // Reconnect wallet to new provider
      if (currentWallet) {
        const provider = walletService.getProvider();
        const connectedWallet = currentWallet.connect(provider);
        setCurrentWallet(connectedWallet);
      }
      
      // Refresh data for new network
      await refreshBalance();
      await refreshTokens();
      await refreshTransactions();
      
      toast({
        title: "Network Changed",
        description: `Connected to ${NETWORKS[networkId].name}`
      });
      
      return true;
    } catch (error) {
      console.error('Error switching network:', error);
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch networks",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add custom token
  const addCustomToken = async (tokenAddress: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate the address
      if (!ethers.utils.isAddress(tokenAddress)) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid token contract address",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if token already exists
      const existingToken = [...tokens, ...userCustomTokens].find(
        t => t.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      if (existingToken) {
        toast({
          title: "Token Already Added",
          description: `${existingToken.symbol} is already in your wallet`,
          variant: "destructive"
        });
        return false;
      }
      
      // Validate and get token details
      const tokenDetails = await tokenService.validateCustomToken(tokenAddress);
      
      // Add to custom tokens
      setUserCustomTokens(prev => [...prev, tokenDetails]);
      
      // Refresh tokens to include the new one
      await refreshTokens();
      
      toast({
        title: "Token Added",
        description: `${tokenDetails.symbol} has been added to your wallet`
      });
      
      return true;
    } catch (error) {
      console.error('Error adding token:', error);
      toast({
        title: "Token Addition Failed",
        description: "Failed to add token. Please verify the contract address.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add custom network
  const addCustomNetwork = async (id: string, networkConfig: NetworkConfig): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Validate network ID
      if (!id || id.trim() === '') {
        toast({
          title: "Invalid Network ID",
          description: "Please provide a valid network identifier",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if network ID already exists
      if (walletService.getAvailableNetworks()[id]) {
        toast({
          title: "Network ID Exists",
          description: `A network with ID "${id}" already exists`,
          variant: "destructive"
        });
        return false;
      }
      
      // Add network
      const result = walletService.addCustomNetwork(id, networkConfig);
      
      if (result) {
        toast({
          title: "Network Added",
          description: `${networkConfig.name} has been added to your networks`
        });
        return true;
      } else {
        toast({
          title: "Failed to Add Network",
          description: "Could not add the network. Please check the network details",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error adding custom network:', error);
      toast({
        title: "Network Addition Failed",
        description: "An error occurred while adding the network",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remove custom network
  const removeCustomNetwork = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const result = walletService.removeCustomNetwork(id);
      
      if (result) {
        toast({
          title: "Network Removed",
          description: "The network has been removed"
        });
        return true;
      } else {
        toast({
          title: "Failed to Remove Network",
          description: "Could not remove the network",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error removing custom network:', error);
      toast({
        title: "Network Removal Failed",
        description: "An error occurred while removing the network",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send transaction
  const sendTransaction = async (toAddress: string, amount: string): Promise<boolean> => {
    if (!currentWallet) return false;
    
    try {
      setIsLoading(true);
      
      // Validate the amount
      const value = parseFloat(amount);
      if (isNaN(value) || value <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount to send",
          variant: "destructive"
        });
        return false;
      }
      
      // Validate the address
      if (!ethers.utils.isAddress(toAddress)) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Ethereum address",
          variant: "destructive"
        });
        return false;
      }
      
      // Check balance
      const balanceEth = parseFloat(walletBalance);
      if (value > balanceEth) {
        toast({
          title: "Insufficient Balance",
          description: `You don't have enough ${currentNetwork.currencySymbol} (${balanceEth} available)`,
          variant: "destructive"
        });
        return false;
      }
      
      // Send transaction
      const tx = await walletService.sendTransaction(currentWallet, toAddress, amount);
      
      // Create transaction record
      const txRecord = transactionService.createTransactionRecord(
        tx,
        TransactionType.SEND,
        walletService.getCurrentNetworkId()
      );
      
      // Store transaction
      await transactionService.storeTransaction(txRecord);
      
      // Update transactions list
      await refreshTransactions();
      
      // Wait for transaction to be mined
      toast({
        title: "Transaction Sent",
        description: `Transaction is being processed. Hash: ${walletService.formatAddress(tx.hash)}`
      });
      
      // Wait for confirmation in background
      tx.wait().then(async (receipt) => {
        // Update transaction status
        await transactionService.updateTransactionStatus(
          txRecord.id,
          receipt.status ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
          {
            blockNumber: receipt.blockNumber,
            confirmations: 1
          }
        );
        
        // Refresh balance and transactions
        await refreshBalance();
        await refreshTransactions();
        
        if (receipt.status) {
          toast({
            title: "Transaction Confirmed",
            description: `Successfully sent ${amount} ${currentNetwork.currencySymbol}`
          });
        } else {
          toast({
            title: "Transaction Failed",
            description: "Your transaction failed to process",
            variant: "destructive"
          });
        }
      }).catch(async (error) => {
        console.error('Transaction failed:', error);
        
        // Update transaction status
        await transactionService.updateTransactionStatus(
          txRecord.id,
          TransactionStatus.FAILED,
          {
            metadata: { error: error.message }
          }
        );
        
        // Refresh transactions
        await refreshTransactions();
        
        toast({
          title: "Transaction Failed",
          description: "Your transaction failed to process",
          variant: "destructive"
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "Transaction Failed",
        description: "An error occurred while sending the transaction",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send token transaction
  const sendToken = async (tokenAddress: string, toAddress: string, amount: string): Promise<boolean> => {
    if (!currentWallet || !walletAddress) return false;
    
    try {
      setIsLoading(true);
      
      // Find token
      const token = tokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
      if (!token) {
        toast({
          title: "Token Not Found",
          description: "The selected token was not found in your wallet",
          variant: "destructive"
        });
        return false;
      }
      
      // Validate the amount
      const value = parseFloat(amount);
      if (isNaN(value) || value <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount to send",
          variant: "destructive"
        });
        return false;
      }
      
      // Validate the address
      if (!ethers.utils.isAddress(toAddress)) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid address",
          variant: "destructive"
        });
        return false;
      }
      
      // Check balance
      const tokenBalance = parseFloat(token.formattedBalance);
      if (value > tokenBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You don't have enough ${token.symbol} (${tokenBalance} available)`,
          variant: "destructive"
        });
        return false;
      }
      
      // Send token
      const tx = await tokenService.sendToken(
        currentWallet,
        token.address,
        toAddress,
        amount,
        token.decimals
      );
      
      // Create transaction record
      const txRecord = transactionService.createTransactionRecord(
        tx,
        TransactionType.TOKEN_SEND,
        walletService.getCurrentNetworkId(),
        {
          tokenAddress: token.address,
          tokenSymbol: token.symbol,
          tokenDecimals: token.decimals,
          tokenAmount: amount
        }
      );
      
      // Store transaction
      await transactionService.storeTransaction(txRecord);
      
      // Update transactions list
      await refreshTransactions();
      
      // Wait for transaction to be mined
      toast({
        title: "Token Transaction Sent",
        description: `Transaction is being processed. Hash: ${walletService.formatAddress(tx.hash)}`
      });
      
      // Wait for confirmation in background
      tx.wait().then(async (receipt) => {
        // Update transaction status
        await transactionService.updateTransactionStatus(
          txRecord.id,
          receipt.status ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
          {
            blockNumber: receipt.blockNumber,
            confirmations: 1
          }
        );
        
        // Refresh balances and transactions
        await refreshTokens();
        await refreshTransactions();
        
        if (receipt.status) {
          toast({
            title: "Transaction Confirmed",
            description: `Successfully sent ${amount} ${token.symbol}`
          });
        } else {
          toast({
            title: "Transaction Failed",
            description: "Your token transaction failed to process",
            variant: "destructive"
          });
        }
      }).catch(async (error) => {
        console.error('Token transaction failed:', error);
        
        // Update transaction status
        await transactionService.updateTransactionStatus(
          txRecord.id,
          TransactionStatus.FAILED,
          {
            metadata: { error: error.message }
          }
        );
        
        // Refresh transactions
        await refreshTransactions();
        
        toast({
          title: "Transaction Failed",
          description: "Your token transaction failed to process",
          variant: "destructive"
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error sending token transaction:', error);
      toast({
        title: "Transaction Failed",
        description: "An error occurred while sending the token transaction",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setCurrentWallet(null);
    setWalletAddress(null);
    setWalletBalance('0');
    setTokens([]);
    setTransactions([]);
    
    // Clear the global accessor
    walletAccessor.setWallet(null);
  };
  
  // Get explorer URL
  const getExplorerUrl = (hashOrAddress: string, type: 'address' | 'tx' = 'address'): string => {
    return walletService.getExplorerUrl(hashOrAddress, type);
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    return walletService.formatAddress(address);
  };
  
  // Context value
  const value: WalletContextProps = {
    currentWallet,
    walletAddress,
    walletBalance,
    isLoading,
    tokens,
    transactions,
    currentNetwork,
    availableNetworks,
    customNetworks,
    createWallet,
    loadWallet,
    sendTransaction,
    sendToken,
    disconnectWallet,
    switchNetwork,
    addCustomToken,
    addCustomNetwork,
    removeCustomNetwork,
    formatAddress,
    refreshBalance,
    refreshTokens,
    refreshTransactions,
    getExplorerUrl
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook for using the wallet context
export function useWallet() {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
} 