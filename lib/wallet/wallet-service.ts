import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

// Network configuration interface
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
}

// Available networks
export const NETWORKS: Record<string, NetworkConfig> = {
  // Test networks
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/your-api-key",
    symbol: "ETH",
    blockExplorerUrl: "https://sepolia.etherscan.io",
  },
  goerli: {
    chainId: 5,
    name: "Goerli",
    rpcUrl: "https://goerli.infura.io/v3/your-api-key",
    symbol: "ETH",
    blockExplorerUrl: "https://goerli.etherscan.io",
  },
  mumbai: {
    chainId: 80001,
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    symbol: "MATIC",
    blockExplorerUrl: "https://mumbai.polygonscan.com",
  },
  // 0G Testnet
  zerogtestnet: {
    chainId: 16600,
    name: "0G Testnet",
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    symbol: "A0GI",
    blockExplorerUrl: "https://blockexplorer-testnet.0g.ai",
  },
  // Mainnet networks
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/your-api-key",
    symbol: "ETH",
    blockExplorerUrl: "https://etherscan.io",
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    symbol: "MATIC",
    blockExplorerUrl: "https://polygonscan.com",
  }
};

// Wallet service class to manage EVM wallet operations
export class EVMWalletService {
  private static instance: EVMWalletService;
  private provider: ethers.providers.JsonRpcProvider;
  private currentNetworkId: string = 'sepolia'; // Default to Sepolia testnet
  private customNetworks: Record<string, NetworkConfig> = {};
  
  private constructor() {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      // Load custom networks from localStorage
      try {
        const savedNetworks = localStorage.getItem('customNetworks');
        if (savedNetworks) {
          this.customNetworks = JSON.parse(savedNetworks);
        }

        // Load last used network from localStorage
        const lastNetwork = localStorage.getItem('lastNetwork');
        if (lastNetwork && (NETWORKS[lastNetwork] || this.customNetworks[lastNetwork])) {
          this.currentNetworkId = lastNetwork;
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }

    // Initialize provider with current network
    const network = this.getCurrentNetwork();
    this.provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
  }
  
  // Singleton pattern
  public static getInstance(): EVMWalletService {
    if (!EVMWalletService.instance) {
      EVMWalletService.instance = new EVMWalletService();
    }
    return EVMWalletService.instance;
  }
  
  // Get the current provider
  public getProvider(): ethers.providers.JsonRpcProvider {
    const network = this.getCurrentNetwork();
    return new ethers.providers.JsonRpcProvider(network.rpcUrl);
  }
  
  // Get current network ID
  public getCurrentNetworkId(): string {
    return this.currentNetworkId;
  }
  
  // Get current network config
  public getCurrentNetwork(): NetworkConfig {
    return NETWORKS[this.currentNetworkId] || this.customNetworks[this.currentNetworkId];
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
  public setNetwork(networkId: string): boolean {
    if (NETWORKS[networkId] || this.customNetworks[networkId]) {
      this.currentNetworkId = networkId;
      this.saveToLocalStorage('lastNetwork', networkId);
      const network = NETWORKS[networkId] || this.customNetworks[networkId];
      this.provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
      return true;
    }
    return false;
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
  
  // Format address to show abbreviated form (e.g., 0x1234...5678)
  public formatAddress(address: string): string {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  // Get a block explorer URL for an address or transaction
  public getExplorerUrl(hashOrAddress: string, type: 'address' | 'tx' = 'address'): string {
    const network = NETWORKS[this.currentNetworkId];
    return `${network.blockExplorerUrl}/${type}/${hashOrAddress}`;
  }
  
  // Add a custom network
  public addCustomNetwork(id: string, config: NetworkConfig): boolean {
    if (NETWORKS[id] || this.customNetworks[id]) {
      return false;
    }

    this.customNetworks[id] = config;
    this.saveToLocalStorage('customNetworks', this.customNetworks);
    return true;
  }
  
  // Remove a custom network
  public removeCustomNetwork(id: string): boolean {
    if (!this.customNetworks[id]) {
      return false;
    }

    if (this.currentNetworkId === id) {
      this.currentNetworkId = 'sepolia';
      this.saveToLocalStorage('lastNetwork', 'sepolia');
    }

    delete this.customNetworks[id];
    this.saveToLocalStorage('customNetworks', this.customNetworks);
    return true;
  }
  
  // Get custom networks
  public getCustomNetworks(): Record<string, NetworkConfig> {
    return { ...this.customNetworks };
  }

  // Validate private key format
  public validatePrivateKey(privateKey: string): boolean {
    try {
      // Check if it's a valid hex string
      if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
        return false;
      }
      
      // Try to create a wallet to validate
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  // Get wallet details without connecting
  public getWalletDetails(privateKey: string): { address: string; network: string } | null {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return {
        address: wallet.address,
        network: this.currentNetworkId
      };
    } catch {
      return null;
    }
  }

  // Save to localStorage helper
  private saveToLocalStorage(key: string, value: any): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }
}

// Export the singleton instance
export const evmWalletService = EVMWalletService.getInstance();

// For backward compatibility
export const walletService = evmWalletService; 