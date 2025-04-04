"use client";

import { ethers } from 'ethers';
import { evmWalletService } from './wallet-service';
import { tokenService } from './token-service';
import { transactionService, TransactionType } from './transaction-service';
import { WalletStorageService } from './wallet-storage';

/**
 * WalletAccessor - A global singleton that provides direct access to EVM wallet functionality
 * This can be used outside of React components, making it accessible from any JavaScript module
 */
class WalletAccessor {
  private static instance: WalletAccessor;
  private currentWallet: ethers.Wallet | null = null;
  private storageService: WalletStorageService;
  
  private constructor() {
    this.storageService = WalletStorageService.getInstance();
  }
  
  public static getInstance(): WalletAccessor {
    if (!WalletAccessor.instance) {
      WalletAccessor.instance = new WalletAccessor();
    }
    return WalletAccessor.instance;
  }
  
  // Set the current wallet - should be called when a wallet is loaded or created
  public setWallet(wallet: ethers.Wallet | null): void {
    this.currentWallet = wallet;
  }
  
  // Get the current wallet
  public getWallet(): ethers.Wallet | null {
    return this.currentWallet;
  }
  
  // Get wallet address
  public getAddress(): string | null {
    return this.currentWallet?.address || null;
  }
  
  // Check if wallet is connected
  public isConnected(): boolean {
    return this.currentWallet !== null;
  }
  
  // Connect the wallet accessor with a wallet instance
  public async connect(wallet: ethers.Wallet): Promise<void> {
    try {
      // Store the wallet
      this.setWallet(wallet);
      
      // Make sure the wallet has a provider
      if (!wallet.provider) {
        const provider = evmWalletService.getProvider();
        wallet.connect(provider);
      }
      
      console.log('Wallet accessor connected to wallet:', wallet.address);
    } catch (error) {
      console.error('Error connecting wallet to accessor:', error);
      throw error;
    }
  }
  
  // Disconnect the current wallet
  public disconnect(): void {
    this.currentWallet = null;
    console.log('Wallet accessor disconnected');
  }
  
  // Get the current network's provider
  public getProvider(): ethers.providers.Provider {
    return evmWalletService.getProvider();
  }
  
  // Get the current network ID
  public getNetworkId(): string {
    return evmWalletService.getCurrentNetworkId();
  }
  
  // Send native currency (ETH/MATIC)
  public async sendNativeCurrency(toAddress: string, amount: string): Promise<ethers.providers.TransactionResponse | null> {
    if (!this.currentWallet) return null;
    
    try {
      const tx = await evmWalletService.sendTransaction(
        this.currentWallet,
        toAddress,
        amount
      );
      
      // Create and store transaction record
      const txRecord = transactionService.createTransactionRecord(
        tx,
        TransactionType.SEND,
        evmWalletService.getCurrentNetworkId()
      );
      
      await transactionService.storeTransaction(txRecord);
      
      return tx;
    } catch (error) {
      console.error('Error sending native currency:', error);
      return null;
    }
  }
  
  // Send ERC-20 token
  public async sendToken(tokenAddress: string, toAddress: string, amount: string): Promise<ethers.providers.TransactionResponse | null> {
    if (!this.currentWallet) return null;
    
    try {
      // Get token details
      const token = await tokenService.getTokenDetails(tokenAddress);
      
      const tx = await tokenService.sendToken(
        this.currentWallet,
        tokenAddress,
        toAddress,
        amount,
        token.decimals
      );
      
      // Create and store transaction record
      const txRecord = transactionService.createTransactionRecord(
        tx,
        TransactionType.TOKEN_SEND,
        evmWalletService.getCurrentNetworkId(),
        {
          tokenAddress,
          tokenSymbol: token.symbol,
          tokenDecimals: token.decimals,
          tokenAmount: amount
        }
      );
      
      await transactionService.storeTransaction(txRecord);
      
      return tx;
    } catch (error) {
      console.error('Error sending token:', error);
      return null;
    }
  }
  
  // Get balance of native currency
  public async getNativeBalance(address?: string): Promise<string> {
    const targetAddress = address || this.currentWallet?.address;
    if (!targetAddress) return '0';
    
    return evmWalletService.getBalance(targetAddress);
  }
  
  // Get balance of a token
  public async getTokenBalance(tokenAddress: string, address?: string): Promise<string> {
    const targetAddress = address || this.currentWallet?.address;
    if (!targetAddress) return '0';
    
    const token = await tokenService.getTokenDetails(tokenAddress);
    const balance = await tokenService.getTokenBalance(tokenAddress, targetAddress);
    
    return tokenService.formatTokenAmount(balance, token.decimals);
  }
  
  // Sign a message
  public async signMessage(message: string): Promise<string | null> {
    if (!this.currentWallet) return null;
    
    try {
      return await this.currentWallet.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }
  
  // Sign a typed data (EIP-712)
  public async signTypedData(domain: any, types: any, value: any): Promise<string | null> {
    if (!this.currentWallet) return null;
    
    try {
      // @ts-ignore - ethers v5 doesn't have proper typing for this
      return await this.currentWallet._signTypedData(domain, types, value);
    } catch (error) {
      console.error('Error signing typed data:', error);
      return null;
    }
  }
  
  // Execute a contract method (read)
  public async callContractMethod(
    contractAddress: string, 
    abi: any[], 
    method: string, 
    params: any[] = []
  ): Promise<any> {
    try {
      const provider = this.getProvider();
      const contract = new ethers.Contract(contractAddress, abi, provider);
      return await contract[method](...params);
    } catch (error) {
      console.error(`Error calling contract method ${method}:`, error);
      throw error;
    }
  }
  
  // Execute a contract method (write)
  public async executeContractMethod(
    contractAddress: string, 
    abi: any[], 
    method: string, 
    params: any[] = [],
    value: ethers.BigNumberish = 0
  ): Promise<ethers.providers.TransactionResponse | null> {
    if (!this.currentWallet) return null;
    
    try {
      const contract = new ethers.Contract(contractAddress, abi, this.currentWallet);
      const tx = await contract[method](...params, { value });
      
      // Create and store transaction record
      const txRecord = transactionService.createTransactionRecord(
        tx,
        TransactionType.CONTRACT_INTERACTION,
        evmWalletService.getCurrentNetworkId(),
        {
          contractAddress,
          methodName: method
        }
      );
      
      await transactionService.storeTransaction(txRecord);
      
      return tx;
    } catch (error) {
      console.error(`Error executing contract method ${method}:`, error);
      return null;
    }
  }
  
  // Get explorer URL for transaction or address
  public getExplorerUrl(hashOrAddress: string, type: 'address' | 'tx' = 'address'): string {
    return evmWalletService.getExplorerUrl(hashOrAddress, type);
  }
  
  // Format address to show abbreviated form (e.g., 0x1234...5678)
  public formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Load wallet from storage
  public async loadWallet(username: string, password: string): Promise<boolean> {
    try {
      const result = await this.storageService.getWallet(username);
      if (!result.success || !result.data) {
        return false;
      }

      const wallet = evmWalletService.decryptWallet(result.data.encryptedWallet, password);
      if (!wallet) {
        return false;
      }

      await this.connect(wallet);
      return true;
    } catch (error) {
      console.error('Error loading wallet:', error);
      return false;
    }
  }

  // Import wallet from private key
  public async importWallet(username: string, privateKey: string, password: string): Promise<boolean> {
    try {
      const result = await this.storageService.importWalletFromPrivateKey(username, privateKey, password);
      if (!result.success) {
        return false;
      }

      const wallet = evmWalletService.getWalletFromPrivateKey(privateKey);
      await this.connect(wallet);
      return true;
    } catch (error) {
      console.error('Error importing wallet:', error);
      return false;
    }
  }

  // Create new wallet
  public async createWallet(username: string, password: string): Promise<boolean> {
    try {
      const wallet = evmWalletService.createWallet();
      const encryptedWallet = evmWalletService.encryptWallet(wallet, password);
      
      const walletData = {
        encryptedWallet,
        address: wallet.address,
        username,
        lastAccessed: Date.now(),
        isImported: false,
        createdAt: Date.now()
      };

      const result = await this.storageService.storeWallet(walletData);
      if (!result.success) {
        return false;
      }

      await this.connect(wallet);
      return true;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return false;
    }
  }

  // Clear wallet data
  public async clearWallet(username: string): Promise<boolean> {
    try {
      const result = await this.storageService.deleteWallet(username);
      if (!result.success) {
        return false;
      }

      this.disconnect();
      return true;
    } catch (error) {
      console.error('Error clearing wallet:', error);
      return false;
    }
  }
}

export const walletAccessor = WalletAccessor.getInstance(); 