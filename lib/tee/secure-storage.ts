/**
 * Secure Storage for Trusted Execution Environment
 * 
 * This module provides a secure storage mechanism for Trusted Applications
 * that ensures isolation between different applications.
 */

import { TrustedApplicationRegistry } from './trusted-application';

/**
 * Interface for encrypted data stored in the secure storage
 */
interface EncryptedData {
  /** The encrypted data as a string */
  data: string;
  /** The ID of the app that owns this data */
  appId: string;
  /** Timestamp when the data was stored */
  timestamp: number;
  /** Optional metadata for the stored data */
  metadata?: Record<string, any>;
}

/**
 * Simulated TEE secure storage that's isolated from regular storage
 * In a real TEE, this would be backed by hardware-protected memory
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private storage: Map<string, EncryptedData> = new Map();
  private initialized: boolean = false;
  private masterKey?: CryptoKey;
  private taRegistry: TrustedApplicationRegistry;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.taRegistry = TrustedApplicationRegistry.getInstance();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }
  
  /**
   * Initialize the secure storage with a master key
   * In a real TEE, this would be derived from hardware-protected keys
   * @param masterKeyMaterial The key material to derive the master key from
   * @returns Promise resolving to success status
   */
  public async initialize(masterKeyMaterial: string): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Use Web Crypto API to derive a key from the provided material
      const encoder = new TextEncoder();
      const keyData = encoder.encode(masterKeyMaterial);
      
      // Create a master key from the raw key material
      this.masterKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false, // Extractable
        ['encrypt', 'decrypt'] // Key usages
      );
      
      console.log('TEE SecureStorage initialized');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize SecureStorage:', error);
      return false;
    }
  }
  
  /**
   * Store data securely
   * @param key The key under which to store the data
   * @param value The data to store
   * @param appId The ID of the app storing the data
   * @param metadata Optional metadata for the stored data
   * @returns Promise resolving to success status
   */
  public async store(
    key: string, 
    value: any, 
    appId: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('SecureStorage not initialized');
    }
    
    // Verify the app is registered and running
    const appState = this.taRegistry.getAppState(appId);
    if (!appState || appState !== 'running') {
      throw new Error(`App ${appId} is not running`);
    }
    
    try {
      // Serialize and encrypt the data
      const serialized = JSON.stringify(value);
      const encryptedData: EncryptedData = {
        data: await this.encryptData(serialized, appId),
        appId,
        timestamp: Date.now(),
        metadata
      };
      
      // Store with app-specific prefix to ensure isolation
      const storageKey = `${appId}:${key}`;
      this.storage.set(storageKey, encryptedData);
      
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }
  
  /**
   * Retrieve securely stored data
   * @param key The key of the data to retrieve
   * @param appId The ID of the app retrieving the data
   * @returns Promise resolving to the retrieved data or null if not found
   */
  public async retrieve<T = any>(key: string, appId: string): Promise<T | null> {
    if (!this.initialized) {
      throw new Error('SecureStorage not initialized');
    }
    
    // Verify the app is registered and running
    const appState = this.taRegistry.getAppState(appId);
    if (!appState || appState !== 'running') {
      throw new Error(`App ${appId} is not running`);
    }
    
    // Use app-specific prefix to ensure isolation
    const storageKey = `${appId}:${key}`;
    const encryptedData = this.storage.get(storageKey);
    
    if (!encryptedData) {
      return null; // Data doesn't exist
    }
    
    // Verify the app has permission to access this data
    if (encryptedData.appId !== appId) {
      console.error(`App ${appId} attempted to access data owned by ${encryptedData.appId}`);
      throw new Error('Access denied');
    }
    
    try {
      // Decrypt the data
      const decrypted = await this.decryptData(encryptedData.data, appId);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }
  
  /**
   * Delete securely stored data
   * @param key The key of the data to delete
   * @param appId The ID of the app deleting the data
   * @returns Promise resolving to success status
   */
  public async delete(key: string, appId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('SecureStorage not initialized');
    }
    
    // Verify the app is registered and running
    const appState = this.taRegistry.getAppState(appId);
    if (!appState || appState !== 'running') {
      throw new Error(`App ${appId} is not running`);
    }
    
    // Use app-specific prefix to ensure isolation
    const storageKey = `${appId}:${key}`;
    const encryptedData = this.storage.get(storageKey);
    
    if (!encryptedData) {
      return true; // Data doesn't exist, so deletion is "successful"
    }
    
    // Verify the app has permission to access this data
    if (encryptedData.appId !== appId) {
      console.error(`App ${appId} attempted to delete data owned by ${encryptedData.appId}`);
      throw new Error('Access denied');
    }
    
    // Delete the data
    return this.storage.delete(storageKey);
  }
  
  /**
   * List all keys for a specific application
   * @param appId The ID of the app
   * @returns Array of keys
   */
  public listKeys(appId: string): string[] {
    if (!this.initialized) {
      throw new Error('SecureStorage not initialized');
    }
    
    // Verify the app is registered and running
    const appState = this.taRegistry.getAppState(appId);
    if (!appState || appState !== 'running') {
      throw new Error(`App ${appId} is not running`);
    }
    
    const keys: string[] = [];
    const prefix = `${appId}:`;
    
    // Collect all keys for this app - fix for the linter error
    Array.from(this.storage.keys()).forEach(key => {
      if (key.startsWith(prefix)) {
        // Extract the actual key (without the app prefix)
        keys.push(key.substring(prefix.length));
      }
    });
    
    return keys;
  }
  
  /**
   * Clear all data for a specific application
   * @param appId The ID of the app
   * @returns Promise resolving to success status
   */
  public async clear(appId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('SecureStorage not initialized');
    }
    
    // Verify the app is registered and running
    const appState = this.taRegistry.getAppState(appId);
    if (!appState || appState !== 'running') {
      throw new Error(`App ${appId} is not running`);
    }
    
    const prefix = `${appId}:`;
    
    // Delete all keys for this app - fix for the linter error
    Array.from(this.storage.keys()).forEach(key => {
      if (key.startsWith(prefix)) {
        this.storage.delete(key);
      }
    });
    
    return true;
  }
  
  /**
   * Encrypt data using the master key
   * In a real TEE, this would use hardware-backed encryption
   * @param data The data to encrypt
   * @param appId The ID of the app encrypting the data
   * @returns Promise resolving to the encrypted data as a string
   */
  private async encryptData(data: string, appId: string): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }
    
    // In a real implementation, we would use AES-GCM with a random IV
    // For this demo, we'll simulate encryption with a simple approach
    
    // Generate a random IV for each encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encode the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.masterKey,
      dataBuffer
    );
    
    // Combine IV and ciphertext and convert to base64
    const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to base64 for storage - fixed approach to handle Uint8Array
    return btoa(Array.from(result).map(byte => String.fromCharCode(byte)).join(''));
  }
  
  /**
   * Decrypt data using the master key
   * @param encryptedData The encrypted data to decrypt
   * @param appId The ID of the app decrypting the data
   * @returns Promise resolving to the decrypted data as a string
   */
  private async decryptData(encryptedData: string, appId: string): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized');
    }
    
    // Convert base64 back to array buffer - fix for the linter error
    const strData = atob(encryptedData);
    const data = new Uint8Array(strData.length);
    for (let i = 0; i < strData.length; i++) {
      data[i] = strData.charCodeAt(i);
    }
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      this.masterKey,
      ciphertext
    );
    
    // Decode the result
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
} 