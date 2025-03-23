import OpenAI from 'openai';
// Use the correct imports from the ai package
import { createDataStream, createDataStreamResponse } from 'ai';

// Set runtime to edge for better performance
export const runtime = 'edge';

// Debug logging function
const debugLog = (message: string, data?: any) => {
  console.log(`[WALLET-AGENT] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Helper functions to simulate wallet interactions
const simulateWalletOperations = {
  getBalance: async (address?: string) => {
    debugLog(`Getting balance for address: ${address || 'current wallet'}`);
    // Simulated balance data
    const result = {
      eth: '1.45',
      tokens: [
        { symbol: 'USDC', balance: '235.65', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
        { symbol: 'LINK', balance: '12.5', address: '0x514910771af9ca656af840dff83e8264ecf986ca' }
      ]
    };
    debugLog('Balance result:', result);
    return result;
  },
  
  getTransactionHistory: async (address?: string) => {
    debugLog(`Getting transaction history for address: ${address || 'current wallet'}`);
    // Simulated transaction history
    const result = [
      { 
        hash: '0x123...abc', 
        type: 'send', 
        amount: '0.05', 
        token: 'ETH', 
        to: '0xabc...123',
        timestamp: Date.now() - 86400000 // 1 day ago
      },
      { 
        hash: '0x456...def', 
        type: 'receive', 
        amount: '100', 
        token: 'USDC', 
        from: '0xdef...456',
        timestamp: Date.now() - 172800000 // 2 days ago
      }
    ];
    debugLog('Transaction history result:', result);
    return result;
  },
  
  getGasPrice: async () => {
    debugLog('Getting current gas prices');
    const result = {
      slow: '15',
      average: '20',
      fast: '25'
    };
    debugLog('Gas price result:', result);
    return result;
  },
  
  estimateSwapFees: async (fromToken: string, toToken: string, amount: string) => {
    debugLog(`Estimating swap fees from ${fromToken} to ${toToken}, amount: ${amount}`);
    const result = {
      estimatedGas: '0.002 ETH',
      priceImpact: '0.05%',
      minimumReceived: amount === '1' && fromToken === 'ETH' && toToken === 'USDC' 
        ? '1950 USDC' 
        : '0'
    };
    debugLog('Swap fee estimation result:', result);
    return result;
  }
};

// Custom wallet function handlers
async function handleWalletFunctions(functionName: string, args: any) {
  debugLog(`Handling function call: ${functionName}`, args);
  try {
    let result;
    switch (functionName) {
      case 'getWalletBalance':
        result = await simulateWalletOperations.getBalance(args?.address);
        break;
      
      case 'getTransactionHistory':
        result = await simulateWalletOperations.getTransactionHistory(args?.address);
        break;
      
      case 'getGasPrice':
        result = await simulateWalletOperations.getGasPrice();
        break;
      
      case 'estimateSwapFees':
        result = await simulateWalletOperations.estimateSwapFees(
          args?.fromToken, 
          args?.toToken, 
          args?.amount
        );
        break;
      
      default:
        result = { error: `Function ${functionName} not implemented` };
    }
    debugLog(`Function ${functionName} result:`, result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    debugLog(`Error in function ${functionName}:`, errorMessage);
    return { error: errorMessage };
  }
}

export async function POST(req: Request) {
  debugLog('Received wallet agent request');
  try {
    const requestData = await req.json();
    debugLog('Request data:', requestData);
    const { messages } = requestData;

    if (!process.env.OPENAI_API_KEY) {
      debugLog('ERROR: Missing OpenAI API key');
      return new Response(JSON.stringify({ error: 'OpenAI API key is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    debugLog('Creating OpenAI chat completion with simple model');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful EVM wallet assistant. You can help users with:
          - Managing their wallet
          - Sending and receiving transactions
          - Checking balances
          - Explaining gas fees and network concepts
          - Providing information about tokens
          - Troubleshooting wallet issues
          
          Keep your responses concise and to the point.`
        },
        ...messages
      ],
      stream: true,
    });
    
    debugLog('OpenAI response received, preparing stream response');
    
    return new Response(response.toReadableStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in wallet agent route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    debugLog('Critical error in wallet agent:', errorMessage);
    return new Response(JSON.stringify({ error: 'Failed to process request', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 