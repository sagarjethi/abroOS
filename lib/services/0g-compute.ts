import { z } from 'zod';
import { ethers } from "ethers";

const API_BASE_URL = process.env.NEXT_PUBLIC_0G_COMPUTE_API_URL || 'https://api-testnet.0g.ai';

// API Response Types
const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']),
  model: z.string().optional(),
  endpoint: z.string().optional(),
  providerAddress: z.string(),
});

const QueryResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  error: z.string().optional(),
  metadata: z.object({
    model: z.string().optional(),
    provider: z.string().optional(),
    isValid: z.boolean().optional(),
    usedFallbackFee: z.boolean().optional(),
    fallbackFeeAmount: z.number().optional(),
  }).optional(),
});

const BalanceInfoSchema = z.object({
  balance: z.number(),
  locked: z.number(),
  address: z.string(),
});

export type Service = z.infer<typeof ServiceSchema>;
export type QueryResponse = z.infer<typeof QueryResponseSchema>;
export type BalanceInfo = z.infer<typeof BalanceInfoSchema>;

class ZeroGComputeService {
  private static instance: ZeroGComputeService;
  private apiKey: string | null = null;
  private wallet: ethers.Wallet | null = null;
  private provider: ethers.providers.JsonRpcProvider | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private currentProviderAddress: string | null = null;

  private constructor() {
    // Initialize with demo configuration regardless of API key
    if (typeof window !== 'undefined') {
      this.initPromise = this.initialize();
    }
  }

  static getInstance(): ZeroGComputeService {
    if (!ZeroGComputeService.instance) {
      ZeroGComputeService.instance = new ZeroGComputeService();
    }
    return ZeroGComputeService.instance;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    // Reinitialize with the new key if needed
    if (!this.initialized) {
      this.initPromise = this.initialize();
    }
  }

  setProviderAddress(address: string) {
    this.currentProviderAddress = address;
  }

  getProviderAddress(): string | null {
    return this.currentProviderAddress;
  }

  private async initialize(): Promise<void> {
    try {
      // Remove the API key check - we'll create a demo environment regardless
      // if (!this.apiKey) {
      //   throw new Error('API key not set');
      // }

      // Create a demo provider regardless of API key
      try {
        this.provider = new ethers.providers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
      } catch (error) {
        console.error("Failed to connect to RPC provider, creating demo provider");
        // If RPC fails, create a local mock provider
        this.provider = new ethers.providers.JsonRpcProvider();
      }
      
      // Always create a demo wallet for development
      this.wallet = ethers.Wallet.createRandom().connect(this.provider);
      
      console.log("ZeroGComputeService initialized with demo wallet:", this.wallet.address);
      this.initialized = true;
    } catch (error: any) {
      console.error("Failed to initialize ZeroGComputeService:", error.message);
      // Don't throw - instead, create a minimal working setup
      this.initialized = true;
      
      // Create minimal wallet and provider if they don't exist yet
      if (!this.wallet || !this.provider) {
        try {
          this.provider = new ethers.providers.JsonRpcProvider();
          this.wallet = ethers.Wallet.createRandom().connect(this.provider);
        } catch (e) {
          console.error("Failed to create fallback wallet/provider:", e);
        }
      }
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initPromise) {
      try {
        await this.initPromise;
      } catch (e) {
        console.error("Initialization failed but continuing with demo mode:", e);
        this.initialized = true; // Force initialization to proceed with demo features
      }
    }
    
    if (!this.wallet || !this.provider) {
      // Create minimal working setup for demo
      this.provider = new ethers.providers.JsonRpcProvider();
      this.wallet = ethers.Wallet.createRandom().connect(this.provider);
      this.initialized = true;
    }
  }

  async getBalance(): Promise<BalanceInfo> {
    await this.ensureInitialized();
    try {
      // In a real implementation, we would call the broker service to get the balance
      // For demo purposes, we're returning mock data
      return {
        balance: 0.5,
        locked: 0.1,
        address: this.wallet!.address,
      };
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async depositFunds(amount: number): Promise<string> {
    await this.ensureInitialized();
    try {
      // In a real implementation, we would call the broker service to deposit funds
      // For demo purposes, we're just logging
      console.log(`Depositing ${amount} to wallet: ${this.wallet!.address}`);
      return "Deposit successful (demo)";
    } catch (error: any) {
      throw new Error(`Failed to deposit funds: ${error.message}`);
    }
  }

  async listServices(): Promise<Service[]> {
    await this.ensureInitialized();
    
    try {
      // In a real implementation, we would call the broker service to get the services
      // For demo purposes, we're returning mock data

      // Wait a simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock services data
      const mockServices: Service[] = [
        {
          id: "service-1",
          name: "GPT-4o",
          description: "Advanced large language model for comprehensive AI assistance. Optimized for complex tasks and detailed responses.",
          status: "active",
          model: "gpt-4o",
          endpoint: API_BASE_URL + "/api/v1",
          providerAddress: "0x123456789abcdef123456789abcdef123456789a",
        },
        {
          id: "service-2",
          name: "Claude 3 Opus",
          description: "High-performance AI assistant with reasoning capabilities. Best for complex technical and creative tasks.",
          status: "active",
          model: "claude-3-opus",
          endpoint: API_BASE_URL + "/api/v1",
          providerAddress: "0x987654321fedcba987654321fedcba987654321f",
        },
        {
          id: "service-3",
          name: "Code Assistant",
          description: "Specialized in programming assistance with multiple language support. Optimized for coding tasks.",
          status: "inactive",
          model: "code-assistant-v1",
          endpoint: API_BASE_URL + "/api/v1",
          providerAddress: "0xabcdef123456789abcdef123456789abcdef1234",
        }
      ];

      return mockServices;
    } catch (error: any) {
      throw new Error(`Failed to list services: ${error.message}`);
    }
  }

  async sendQuery(query: string): Promise<QueryResponse> {
    await this.ensureInitialized();
    
    if (!this.currentProviderAddress) {
      throw new Error('No provider selected. Please select a service provider first.');
    }

    try {
      // In a real implementation, we would call the broker service to send the query
      // For demo purposes, we're simulating a response

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a response based on the query
      let response = '';
      
      if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
        response = "Hello! I'm the 0G Compute demo assistant. How can I help you today?";
      } else if (query.toLowerCase().includes('help')) {
        response = "I'm here to help! You can ask me questions about 0G Compute, blockchain technology, or general knowledge topics.";
      } else if (query.toLowerCase().includes('blockchain') || query.toLowerCase().includes('crypto')) {
        response = "Blockchain technology enables decentralized, secure transactions and is the foundation of cryptocurrencies. 0G Compute leverages blockchain for decentralized AI computation.";
      } else if (query.toLowerCase().includes('0g') || query.toLowerCase().includes('zero g')) {
        response = "0G is a decentralized computing network that allows AI models to be served in a trustless, permissionless way. It uses blockchain technology to handle payments and service discovery.";
      } else {
        response = `Thanks for your question about "${query}". In the 0G Compute network, your query would be processed by a decentralized AI service provider, with payments handled automatically through the blockchain.`;
      }

      return {
        success: true,
        data: response,
        metadata: {
          model: "demo-model",
          provider: this.currentProviderAddress,
          isValid: true
        }
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Query failed: ${error.message}`
      };
    }
  }

  async settleFee(serviceId: string): Promise<{ success: boolean }> {
    await this.ensureInitialized();
    
    try {
      // In a real implementation, we would call the broker service to settle the fee
      // For demo purposes, we're just logging
      console.log(`Settling fee for service ${serviceId}`);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to settle fee: ${error.message}`);
    }
  }
}

export const zeroGCompute = ZeroGComputeService.getInstance(); 