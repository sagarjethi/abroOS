"use client";

import { ethers } from 'ethers';

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// Transaction type enum
export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  TOKEN_SEND = 'token_send',
  TOKEN_RECEIVE = 'token_receive',
  CONTRACT_INTERACTION = 'contract_interaction'
}

// Transaction record interface
export interface TransactionRecord {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  timestamp: number;
  status: TransactionStatus;
  blockNumber?: number;
  confirmations?: number;
  networkId: string;
  type: TransactionType;
  // For token transactions
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  // Additional metadata
  metadata?: Record<string, any>;
}

// Storage key for indexedDB or localStorage
const TRANSACTIONS_STORE = 'walletTransactions';
const DB_NAME = 'AbroOSWalletDB';
const DB_VERSION = 2;

// Transaction service class for managing transaction history
export class TransactionService {
  private static instance: TransactionService;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  
  private constructor() {}
  
  // Singleton pattern
  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }
  
  // Initialize IndexedDB
  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    return new Promise<boolean>((resolve) => {
      if (!window.indexedDB) {
        console.error('IndexedDB not supported for transaction history.');
        this.isInitialized = true;
        resolve(false);
        return;
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB for transactions:', request.error);
        this.isInitialized = true;
        resolve(false);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve(true);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create transaction store if it doesn't exist
        if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
          const store = db.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id' });
          
          // Create indexes for faster lookups
          store.createIndex('hash', 'hash', { unique: true });
          store.createIndex('from', 'from', { unique: false });
          store.createIndex('to', 'to', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('networkId', 'networkId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }
  
  // Store a transaction
  public async storeTransaction(transaction: TransactionRecord): Promise<boolean> {
    await this.init();
    
    if (!this.db) {
      console.error('IndexedDB not available for storing transactions');
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
      try {
        const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.put(transaction);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error storing transaction:', request.error);
          resolve(false);
        };
      } catch (error) {
        console.error('Exception storing transaction:', error);
        resolve(false);
      }
    });
  }
  
  // Retrieve transactions for an address
  public async getTransactionsByAddress(
    address: string,
    options?: {
      limit?: number;
      offset?: number;
      networkId?: string;
      type?: TransactionType;
      status?: TransactionStatus;
    }
  ): Promise<TransactionRecord[]> {
    await this.init();
    
    if (!this.db) {
      console.error('IndexedDB not available for retrieving transactions');
      return [];
    }
    
    const { limit = 50, offset = 0, networkId, type, status } = options || {};
    
    return new Promise<TransactionRecord[]>((resolve) => {
      try {
        const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readonly');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        
        // We'll get all transactions and filter in memory since IndexedDB
        // doesn't easily support complex queries
        const request = store.getAll();
        
        request.onsuccess = () => {
          let transactions = request.result as TransactionRecord[];
          
          // Filter by address (from or to)
          transactions = transactions.filter(tx => 
            tx.from.toLowerCase() === address.toLowerCase() || 
            tx.to.toLowerCase() === address.toLowerCase()
          );
          
          // Apply additional filters
          if (networkId) {
            transactions = transactions.filter(tx => tx.networkId === networkId);
          }
          
          if (type) {
            transactions = transactions.filter(tx => tx.type === type);
          }
          
          if (status) {
            transactions = transactions.filter(tx => tx.status === status);
          }
          
          // Sort by timestamp (newest first)
          transactions.sort((a, b) => b.timestamp - a.timestamp);
          
          // Apply pagination
          transactions = transactions.slice(offset, offset + limit);
          
          resolve(transactions);
        };
        
        request.onerror = () => {
          console.error('Error retrieving transactions:', request.error);
          resolve([]);
        };
      } catch (error) {
        console.error('Exception retrieving transactions:', error);
        resolve([]);
      }
    });
  }
  
  // Retrieve a transaction by hash
  public async getTransactionByHash(hash: string): Promise<TransactionRecord | null> {
    await this.init();
    
    if (!this.db) {
      console.error('IndexedDB not available for retrieving transaction');
      return null;
    }
    
    return new Promise<TransactionRecord | null>((resolve) => {
      try {
        const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readonly');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const index = store.index('hash');
        const request = index.get(hash);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = () => {
          console.error('Error retrieving transaction by hash:', request.error);
          resolve(null);
        };
      } catch (error) {
        console.error('Exception retrieving transaction by hash:', error);
        resolve(null);
      }
    });
  }
  
  // Update transaction status
  public async updateTransactionStatus(id: string, status: TransactionStatus, updates: Partial<TransactionRecord> = {}): Promise<boolean> {
    await this.init();
    
    if (!this.db) {
      console.error('IndexedDB not available for updating transaction');
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
      try {
        const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.get(id);
        
        request.onsuccess = () => {
          const transaction = request.result as TransactionRecord;
          
          if (!transaction) {
            resolve(false);
            return;
          }
          
          const updatedTransaction = {
            ...transaction,
            status,
            ...updates
          };
          
          const updateRequest = store.put(updatedTransaction);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = () => {
            console.error('Error updating transaction status:', updateRequest.error);
            resolve(false);
          };
        };
        
        request.onerror = () => {
          console.error('Error retrieving transaction for update:', request.error);
          resolve(false);
        };
      } catch (error) {
        console.error('Exception updating transaction:', error);
        resolve(false);
      }
    });
  }
  
  // Create a transaction record from a provider transaction
  public createTransactionRecord(
    tx: ethers.providers.TransactionResponse,
    type: TransactionType,
    networkId: string,
    metadata?: Record<string, any>
  ): TransactionRecord {
    return {
      id: `${tx.hash}-${networkId}`,
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString() || '0',
      gasLimit: tx.gasLimit.toString(),
      timestamp: Date.now(),
      status: TransactionStatus.PENDING,
      networkId,
      type,
      metadata
    };
  }
  
  // Delete a transaction record
  public async deleteTransaction(id: string): Promise<boolean> {
    await this.init();
    
    if (!this.db) {
      console.error('IndexedDB not available for deleting transaction');
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
      try {
        const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('Error deleting transaction:', request.error);
          resolve(false);
        };
      } catch (error) {
        console.error('Exception deleting transaction:', error);
        resolve(false);
      }
    });
  }
  
  // Clear all transactions for a network
  public async clearNetworkTransactions(networkId: string): Promise<boolean> {
    await this.init();
    
    if (!this.db) {
      console.error('IndexedDB not available for clearing transactions');
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
      try {
        const tx = this.db!.transaction([TRANSACTIONS_STORE], 'readwrite');
        const store = tx.objectStore(TRANSACTIONS_STORE);
        const index = store.index('networkId');
        const request = index.openCursor(networkId);
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
          
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve(true);
          }
        };
        
        request.onerror = () => {
          console.error('Error clearing network transactions:', request.error);
          resolve(false);
        };
      } catch (error) {
        console.error('Exception clearing network transactions:', error);
        resolve(false);
      }
    });
  }
}

export const transactionService = TransactionService.getInstance(); 