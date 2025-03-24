"use client";

import { ethers } from 'ethers';
import { walletService } from './wallet-service';

// ERC-20 standard interface (minimal ABI)
const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  // Write functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
];

// Network token configurations
export const NETWORK_TOKENS: Record<string, TokenConfig[]> = {
  'sepolia': [
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Uniswap on Sepolia
      name: 'Uniswap',
      symbol: 'UNI',
      decimals: 18,
      logoURI: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
    },
    {
      address: '0x3587b2F7E0E2D6166d6C14230e7Fe160252B0ba4', // Test USDC on Sepolia
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    }
  ],
  'goerli': [
    {
      address: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', // WETH on Goerli
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    },
    {
      address: '0x07865c6e87b9f70255377e024ace6630c1eaa37f', // USDC on Goerli
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    }
  ],
  'polygon-mumbai': [
    {
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', // WMATIC on Mumbai
      name: 'Wrapped Matic',
      symbol: 'WMATIC',
      decimals: 18,
      logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png'
    }
  ]
};

// Token configuration interface
export interface TokenConfig {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

// Token with balance interface
export interface TokenWithBalance extends TokenConfig {
  balance: string;
  formattedBalance: string;
}

// Token service class for ERC-20 token operations
export class TokenService {
  private static instance: TokenService;
  
  private constructor() {}
  
  // Singleton pattern
  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }
  
  // Get token contract instance
  private getTokenContract(tokenAddress: string): ethers.Contract {
    const provider = walletService.getProvider();
    return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  }
  
  // Get token details
  public async getTokenDetails(tokenAddress: string): Promise<TokenConfig> {
    try {
      const contract = this.getTokenContract(tokenAddress);
      
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ]);
      
      return {
        address: tokenAddress,
        name,
        symbol,
        decimals
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      throw new Error('Invalid ERC-20 token address');
    }
  }
  
  // Get token balance for an address
  public async getTokenBalance(tokenAddress: string, ownerAddress: string): Promise<string> {
    try {
      const contract = this.getTokenContract(tokenAddress);
      const balance = await contract.balanceOf(ownerAddress);
      
      return balance.toString();
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }
  
  // Format token amount based on decimals
  public formatTokenAmount(amount: string, decimals: number): string {
    return ethers.utils.formatUnits(amount, decimals);
  }
  
  // Parse token amount based on decimals
  public parseTokenAmount(amount: string, decimals: number): ethers.BigNumber {
    return ethers.utils.parseUnits(amount, decimals);
  }
  
  // Get all token balances for an address
  public async getAllTokenBalances(
    ownerAddress: string, 
    tokens: TokenConfig[]
  ): Promise<TokenWithBalance[]> {
    try {
      const tokenPromises = tokens.map(async (token) => {
        const balance = await this.getTokenBalance(token.address, ownerAddress);
        const formattedBalance = this.formatTokenAmount(balance, token.decimals);
        
        return {
          ...token,
          balance,
          formattedBalance
        };
      });
      
      return await Promise.all(tokenPromises);
    } catch (error) {
      console.error('Error fetching all token balances:', error);
      return [];
    }
  }
  
  // Send tokens
  public async sendToken(
    wallet: ethers.Wallet,
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals: number
  ): Promise<ethers.providers.TransactionResponse> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
      const parsedAmount = this.parseTokenAmount(amount, decimals);
      
      return await contract.transfer(toAddress, parsedAmount);
    } catch (error) {
      console.error('Error sending token:', error);
      throw error;
    }
  }
  
  // Get predefined tokens for a network
  public getNetworkTokens(networkId: string): TokenConfig[] {
    return NETWORK_TOKENS[networkId] || [];
  }
  
  // Add custom token
  public async validateCustomToken(tokenAddress: string): Promise<TokenConfig> {
    return await this.getTokenDetails(tokenAddress);
  }
}

export const tokenService = TokenService.getInstance(); 