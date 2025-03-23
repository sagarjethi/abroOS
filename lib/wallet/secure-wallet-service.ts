"use client";

import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Constants
const BROWSER_ID_KEY = 'browser_wallet_id';
const WALLET_DATA_KEY = 'encrypted_wallet_data';
const AUTO_LOCK_TIMEOUT = 15 * 60 * 1000; // 15 minutes

interface WalletData {
  encryptedPrivateKey: string;
  address: string;
  publicKey: string;
  timestamp: number;
  browserId: string;
  kdfParams: {
    iterations: number;
    salt: string;
  };
}

interface DecryptedWallet {
  wallet: ethers.Wallet;
  timestamp: number;
}

export class SecureWalletService {
  private static instance: SecureWalletService;
  private decryptedWallet: DecryptedWallet | null = null;
  private lockTimer: NodeJS.Timeout | null = null;
  private browserId: string | null = null;
  
  private constructor() {
    // Initialize browser ID
    if (typeof window !== 'undefined') {
      this.browserId = localStorage.getItem(BROWSER_ID_KEY);
      if (!this.browserId) {
        this.browserId = uuidv4();
        localStorage.setItem(BROWSER_ID_KEY, this.browserId);
      }
    }
  }
  
  public static getInstance(): SecureWalletService {
    if (!SecureWalletService.instance) {
      SecureWalletService.instance = new SecureWalletService();
    }
    return SecureWalletService.instance;
  }
  
  // Check if a wallet exists for this browser
  public walletExists(): boolean {
    if (typeof window === 'undefined') return false;
    const data = localStorage.getItem(WALLET_DATA_KEY);
    return !!data;
  }
  
  // Generate and store a new wallet
  public async generateWallet(password: string): Promise<string> {
    if (!this.browserId) throw new Error('Browser ID not initialized');
    
    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    
    // Generate KDF parameters
    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const iterations = 10000;
    
    // Derive key from password
    const key = this.deriveKey(password, salt, iterations);
    
    // Encrypt private key
    const encryptedPrivateKey = CryptoJS.AES.encrypt(
      wallet.privateKey,
      key
    ).toString();
    
    // Store wallet data
    const walletData: WalletData = {
      encryptedPrivateKey,
      address: wallet.address,
      publicKey: wallet.publicKey,
      timestamp: Date.now(),
      browserId: this.browserId,
      kdfParams: {
        iterations,
        salt,
      },
    };
    
    localStorage.setItem(WALLET_DATA_KEY, JSON.stringify(walletData));
    
    // Store decrypted wallet in memory
    this.decryptedWallet = {
      wallet,
      timestamp: Date.now(),
    };
    
    // Start auto-lock timer
    this.startLockTimer();
    
    return wallet.address;
  }
  
  // Load and decrypt existing wallet
  public async loadWallet(password: string): Promise<string> {
    if (!this.browserId) throw new Error('Browser ID not initialized');
    
    const data = localStorage.getItem(WALLET_DATA_KEY);
    if (!data) throw new Error('No wallet found');
    
    const walletData: WalletData = JSON.parse(data);
    
    // Verify browser ID
    if (walletData.browserId !== this.browserId) {
      throw new Error('Wallet does not belong to this browser');
    }
    
    // Derive key from password using stored KDF params
    const key = this.deriveKey(
      password,
      walletData.kdfParams.salt,
      walletData.kdfParams.iterations
    );
    
    // Decrypt private key
    try {
      const bytes = CryptoJS.AES.decrypt(walletData.encryptedPrivateKey, key);
      const privateKey = bytes.toString(CryptoJS.enc.Utf8);
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      // Verify address matches
      if (wallet.address !== walletData.address) {
        throw new Error('Wallet address mismatch');
      }
      
      // Store decrypted wallet in memory
      this.decryptedWallet = {
        wallet,
        timestamp: Date.now(),
      };
      
      // Start auto-lock timer
      this.startLockTimer();
      
      return wallet.address;
    } catch (error) {
      throw new Error('Invalid password');
    }
  }
  
  // Get the current wallet (if unlocked)
  public getWallet(): ethers.Wallet | null {
    if (!this.decryptedWallet) return null;
    
    // Check if wallet should be auto-locked
    if (Date.now() - this.decryptedWallet.timestamp > AUTO_LOCK_TIMEOUT) {
      this.lockWallet();
      return null;
    }
    
    // Update timestamp and restart timer
    this.decryptedWallet.timestamp = Date.now();
    this.startLockTimer();
    
    return this.decryptedWallet.wallet;
  }
  
  // Lock the wallet
  public lockWallet(): void {
    this.decryptedWallet = null;
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
  }
  
  // Clear wallet data
  public clearWallet(): void {
    this.lockWallet();
    localStorage.removeItem(WALLET_DATA_KEY);
  }
  
  // Helper: Derive encryption key from password
  private deriveKey(password: string, salt: string, iterations: number): string {
    return CryptoJS.PBKDF2(
      password + this.browserId, // Add browser ID to password for extra security
      salt,
      {
        keySize: 256 / 32,
        iterations,
      }
    ).toString();
  }
  
  // Helper: Start auto-lock timer
  private startLockTimer(): void {
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
    }
    
    this.lockTimer = setTimeout(() => {
      this.lockWallet();
    }, AUTO_LOCK_TIMEOUT);
  }
} 