"use client";

import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// Network configuration interface
export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  blockExplorerUrl: string;
  isTestnet: boolean;
}

// Available networks
export const NETWORKS: Record<string, NetworkConfig> = {
  // Test networks
  sepolia: {
    name: "Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    chainId: 11155111,
    currencySymbol: "ETH",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    isTestnet: true
  },
  goerli: {
    name: "Goerli",
    rpcUrl: "https://rpc.goerli.mudit.blog",
    chainId: 5,
    currencySymbol: "ETH",
    blockExplorerUrl: "https://goerli.etherscan.io",
    isTestnet: true
  },
  mumbai: {
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    currencySymbol: "MATIC",
    blockExplorerUrl: "https://mumbai.polygonscan.com",
    isTestnet: true
  },
  // 0G Testnet
  zerogtestnet: {
    name: "0G Testnet",
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    chainId: 16600,
    currencySymbol: "A0GI",
    blockExplorerUrl: "https://blockexplorer-testnet.0g.ai",
    isTestnet: true
  },
  // Mainnet networks
  ethereum: {
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
    chainId: 1,
    currencySymbol: "ETH",
    blockExplorerUrl: "https://etherscan.io",
    isTestnet: false
  },
  polygon: {
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    chainId: 137,
    currencySymbol: "MATIC",
    blockExplorerUrl: "https://polygonscan.com",
    isTestnet: false
  }
};

// Wallet service class to manage Ethereum wallet operations
export class WalletService {
  private static instance: WalletService;
  private provider: ethers.providers.JsonRpcProvider;
  private currentNetwork: string = 'sepolia';
  private customNetworks: Record<string, NetworkConfig> = {};
  
  private constructor() {
    // Default to Sepolia testnet
    this.provider = new ethers.providers.JsonRpcProvider(NETWORKS.sepolia.rpcUrl);
    
    // Try to load saved custom networks from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedNetworks = localStorage.getItem('customNetworks');
        if (savedNetworks) {
          this.customNetworks = JSON.parse(savedNetworks);
        }
      } catch (error) {
        console.error('Failed to load custom networks:', error);
      }
    }
  }
  
  // Singleton pattern
  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }
  
  // Get the current provider
  public getProvider(): ethers.providers.JsonRpcProvider {
    return this.provider;
  }
  
  // Get current network ID
  public getCurrentNetworkId(): string {
    return this.currentNetwork;
  }
  
  // Get current network config
  public getCurrentNetwork(): NetworkConfig {
    return NETWORKS[this.currentNetwork];
  }
  
  // Get all available networks including custom networks
  public getAvailableNetworks(): Record<string, NetworkConfig> {
    return { ...NETWORKS, ...this.customNetworks };
  }
  
  // Create a new random wallet
  public createWallet(): ethers.Wallet {
    const wallet = ethers.Wallet.createRandom();
    return wallet.connect(this.provider);
  }
  
  // Get wallet from private key
  public getWalletFromPrivateKey(privateKey: string): ethers.Wallet {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.connect(this.provider);
  }
  
  // Get wallet from mnemonic
  public getWalletFromMnemonic(mnemonic: string): ethers.Wallet {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    return wallet.connect(this.provider);
  }
  
  // Encrypt wallet with password
  public encryptWallet(wallet: ethers.Wallet, password: string): string {
    const walletData = {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || null
    };
    
    const stringData = JSON.stringify(walletData);
    return CryptoJS.AES.encrypt(stringData, password).toString();
  }
  
  // Decrypt wallet with password
  public decryptWallet(encryptedWallet: string, password: string): ethers.Wallet | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedWallet, password);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      
      let wallet: ethers.Wallet;
      
      if (decryptedData.mnemonic) {
        wallet = ethers.Wallet.fromMnemonic(decryptedData.mnemonic);
      } else {
        wallet = new ethers.Wallet(decryptedData.privateKey);
      }
      
      return wallet.connect(this.provider);
    } catch (error) {
      console.error('Failed to decrypt wallet:', error);
      return null;
    }
  }
  
  // Get wallet balance
  public async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
  
  // Send transaction
  public async sendTransaction(
    wallet: ethers.Wallet,
    toAddress: string,
    amount: string
  ): Promise<ethers.providers.TransactionResponse> {
    const tx = {
      to: toAddress,
      value: ethers.utils.parseEther(amount)
    };
    
    return wallet.sendTransaction(tx);
  }
  
  // Change active network
  public setNetwork(networkId: string): void {
    const allNetworks = this.getAvailableNetworks();
    if (!allNetworks[networkId]) {
      throw new Error(`Network ${networkId} not supported`);
    }
    
    this.currentNetwork = networkId;
    this.provider = new ethers.providers.JsonRpcProvider(allNetworks[networkId].rpcUrl);
  }
  
  // Custom provider setter (for custom RPC URLs)
  public setProvider(networkUrl: string): void {
    this.provider = new ethers.providers.JsonRpcProvider(networkUrl);
  }
  
  // Get current network details
  public async getNetwork(): Promise<ethers.providers.Network> {
    return this.provider.getNetwork();
  }
  
  // Get gas price estimate
  public async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  }
  
  // Estimate gas for a transaction
  public async estimateGas(tx: Partial<ethers.providers.TransactionRequest>): Promise<string> {
    const gas = await this.provider.estimateGas(tx);
    return gas.toString();
  }
  
  // Format address for display (shortening)
  public formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  // Get a block explorer URL for an address or transaction
  public getExplorerUrl(hashOrAddress: string, type: 'address' | 'tx' = 'address'): string {
    const network = NETWORKS[this.currentNetwork];
    return `${network.blockExplorerUrl}/${type}/${hashOrAddress}`;
  }
  
  // Add a custom network
  public addCustomNetwork(
    id: string,
    networkConfig: NetworkConfig
  ): boolean {
    try {
      // Validate the network config
      if (!networkConfig.name || !networkConfig.rpcUrl || !networkConfig.chainId) {
        throw new Error('Invalid network configuration');
      }
      
      // Test the RPC URL
      const testProvider = new ethers.providers.JsonRpcProvider(networkConfig.rpcUrl);
      
      // Add to custom networks
      this.customNetworks[id] = networkConfig;
      
      // Save to localStorage if available
      if (typeof window !== 'undefined') {
        localStorage.setItem('customNetworks', JSON.stringify(this.customNetworks));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to add custom network:', error);
      return false;
    }
  }
  
  // Remove a custom network
  public removeCustomNetwork(id: string): boolean {
    // Cannot remove default networks
    if (NETWORKS[id]) {
      return false;
    }
    
    // Check if network exists
    if (!this.customNetworks[id]) {
      return false;
    }
    
    // Check if this is the active network
    if (this.currentNetwork === id) {
      // Switch to a default network
      this.setNetwork('sepolia');
    }
    
    // Remove from custom networks
    delete this.customNetworks[id];
    
    // Save to localStorage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem('customNetworks', JSON.stringify(this.customNetworks));
    }
    
    return true;
  }
  
  // Get custom networks
  public getCustomNetworks(): Record<string, NetworkConfig> {
    return { ...this.customNetworks };
  }
}

export const walletService = WalletService.getInstance(); 