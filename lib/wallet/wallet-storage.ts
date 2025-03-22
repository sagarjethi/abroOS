"use client";

import CryptoJS from 'crypto-js';

// Constants
const STORAGE_KEY_PREFIX = 'abroOs_wallet_';
const DB_NAME = 'AbroOSWalletDB';
const DB_VERSION = 1;
const WALLET_STORE = 'walletStore';

// Interface for user wallet data
export interface UserWalletData {
  encryptedWallet: string;
  address: string;
  username: string;
  lastAccessed: number;
}

// Interface for wallet database operations result
interface WalletStorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Wallet storage service for securely storing wallet data
export class WalletStorageService {
  private static instance: WalletStorageService;
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  
  private constructor() {}
  
  // Singleton pattern
  public static getInstance(): WalletStorageService {
    if (!WalletStorageService.instance) {
      WalletStorageService.instance = new WalletStorageService();
    }
    return WalletStorageService.instance;
  }
  
  // Initialize IndexedDB
  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    return new Promise<boolean>((resolve) => {
      if (!window.indexedDB) {
        console.error('IndexedDB not supported. Falling back to localStorage');
        this.isInitialized = true;
        resolve(false);
        return;
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
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
        
        // Create wallet store
        if (!db.objectStoreNames.contains(WALLET_STORE)) {
          const store = db.createObjectStore(WALLET_STORE, { keyPath: 'username' });
          store.createIndex('address', 'address', { unique: true });
          store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
      };
    });
  }
  
  // Store wallet data in IndexedDB or localStorage as fallback
  public async storeWallet(walletData: UserWalletData): Promise<WalletStorageResult<void>> {
    await this.init();
    
    try {
      if (this.db) {
        // Store in IndexedDB
        return this.storeWalletInIndexedDB(walletData);
      } else {
        // Fall back to localStorage
        return this.storeWalletInLocalStorage(walletData);
      }
    } catch (error) {
      console.error('Error storing wallet:', error);
      return { success: false, error: 'Failed to store wallet' };
    }
  }
  
  // Get wallet data by username
  public async getWallet(username: string): Promise<WalletStorageResult<UserWalletData>> {
    await this.init();
    
    try {
      if (this.db) {
        // Get from IndexedDB
        return this.getWalletFromIndexedDB(username);
      } else {
        // Fall back to localStorage
        return this.getWalletFromLocalStorage(username);
      }
    } catch (error) {
      console.error('Error getting wallet:', error);
      return { success: false, error: 'Failed to get wallet' };
    }
  }
  
  // Check if a wallet exists for the given username
  public async hasWallet(username: string): Promise<boolean> {
    const result = await this.getWallet(username);
    return result.success && !!result.data;
  }
  
  // Update wallet data
  public async updateWallet(walletData: UserWalletData): Promise<WalletStorageResult<void>> {
    return this.storeWallet(walletData);
  }
  
  // Delete wallet data
  public async deleteWallet(username: string): Promise<WalletStorageResult<void>> {
    await this.init();
    
    try {
      if (this.db) {
        // Delete from IndexedDB
        return this.deleteWalletFromIndexedDB(username);
      } else {
        // Fall back to localStorage
        return this.deleteWalletFromLocalStorage(username);
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      return { success: false, error: 'Failed to delete wallet' };
    }
  }
  
  // Get all wallets (for administration)
  public async getAllWallets(): Promise<WalletStorageResult<UserWalletData[]>> {
    await this.init();
    
    try {
      if (this.db) {
        // Get all from IndexedDB
        return this.getAllWalletsFromIndexedDB();
      } else {
        // Fall back to localStorage
        return this.getAllWalletsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error getting all wallets:', error);
      return { success: false, error: 'Failed to get all wallets' };
    }
  }
  
  // Private methods for IndexedDB operations
  private storeWalletInIndexedDB(walletData: UserWalletData): Promise<WalletStorageResult<void>> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([WALLET_STORE], 'readwrite');
      const store = transaction.objectStore(WALLET_STORE);
      const request = store.put(walletData);
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        resolve({ success: false, error: request.error?.message || 'Unknown error' });
      };
    });
  }
  
  private getWalletFromIndexedDB(username: string): Promise<WalletStorageResult<UserWalletData>> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([WALLET_STORE], 'readonly');
      const store = transaction.objectStore(WALLET_STORE);
      const request = store.get(username);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve({ success: true, data: request.result });
        } else {
          resolve({ success: false, error: 'Wallet not found' });
        }
      };
      
      request.onerror = () => {
        resolve({ success: false, error: request.error?.message || 'Unknown error' });
      };
    });
  }
  
  private deleteWalletFromIndexedDB(username: string): Promise<WalletStorageResult<void>> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([WALLET_STORE], 'readwrite');
      const store = transaction.objectStore(WALLET_STORE);
      const request = store.delete(username);
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        resolve({ success: false, error: request.error?.message || 'Unknown error' });
      };
    });
  }
  
  private getAllWalletsFromIndexedDB(): Promise<WalletStorageResult<UserWalletData[]>> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([WALLET_STORE], 'readonly');
      const store = transaction.objectStore(WALLET_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve({ success: true, data: request.result });
      };
      
      request.onerror = () => {
        resolve({ success: false, error: request.error?.message || 'Unknown error' });
      };
    });
  }
  
  // Private methods for localStorage operations (fallback)
  private storeWalletInLocalStorage(walletData: UserWalletData): WalletStorageResult<void> {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + walletData.username, JSON.stringify(walletData));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'LocalStorage error' };
    }
  }
  
  private getWalletFromLocalStorage(username: string): WalletStorageResult<UserWalletData> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + username);
      if (!data) {
        return { success: false, error: 'Wallet not found' };
      }
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      return { success: false, error: 'LocalStorage error' };
    }
  }
  
  private deleteWalletFromLocalStorage(username: string): WalletStorageResult<void> {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + username);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'LocalStorage error' };
    }
  }
  
  private getAllWalletsFromLocalStorage(): WalletStorageResult<UserWalletData[]> {
    try {
      const wallets: UserWalletData[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          const data = localStorage.getItem(key);
          if (data) {
            wallets.push(JSON.parse(data));
          }
        }
      }
      return { success: true, data: wallets };
    } catch (error) {
      return { success: false, error: 'LocalStorage error' };
    }
  }
}

export const walletStorage = WalletStorageService.getInstance(); 