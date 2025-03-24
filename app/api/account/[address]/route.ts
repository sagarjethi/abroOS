import { NextRequest, NextResponse } from 'next/server';
// Remove client-side storage dependency
// import { WalletStorageService } from '../../../../lib/wallet/wallet-storage';

// const walletStorage = WalletStorageService.getInstance();

// Mock signed message type
interface SignMessageHistoryItem {
  id: string;
  message: string;
  signature: string;
  signer: string;
  domainUrl?: string;
  createdAt: number;
}

interface AccountData {
  name: string;
  balance: string;
  owner: string;
  assets: Array<{
    symbol: string;
    name: string;
    balance: string;
    value: string;
    icon?: string;
  }>;
  transactions: Array<{
    hash: string;
    type: 'send' | 'receive';
    amount: string;
    timestamp: string;
  }>;
  signedMessages: Array<SignMessageHistoryItem>;
}

// Simple mock function to simulate account data for deployments
async function getMockAccountData(address: string): Promise<AccountData | null> {
  // For development/preview, return mock data
  console.log(`[SERVER] Generating mock account data for: ${address}`);
  
  return {
    name: `Account ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    balance: '1.5 ETH',
    owner: address,
    assets: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: '1.5',
        value: '$3,450.00',
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1,000.00',
        value: '$1,000.00',
      },
      {
        symbol: 'WETH',
        name: 'Wrapped Ethereum',
        balance: '0.5',
        value: '$1,150.00',
      }
    ],
    transactions: [
      {
        hash: '0x123...abc',
        type: 'send',
        amount: '0.1 ETH',
        timestamp: '2024-02-17 14:30',
      },
      {
        hash: '0x456...def',
        type: 'receive',
        amount: '0.5 ETH',
        timestamp: '2024-02-17 12:15',
      },
    ],
    signedMessages: [],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;

  try {
    // For deployment preview, use mock data instead of client storage
    const accountData = await getMockAccountData(address);
    
    if (!accountData) {
      return NextResponse.json({
        error: "Account not found"
      }, { status: 404 });
    }

    return NextResponse.json(accountData);
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({
      error: "Failed to fetch account details"
    }, { status: 500 });
  }
} 