import { NextRequest, NextResponse } from 'next/server';
// Remove client-side storage dependency
// import { WalletStorageService, UserWalletData } from '../../../lib/wallet/wallet-storage';
import { evmWalletService } from '../../../lib/wallet/wallet-service';

// const walletStorage = WalletStorageService.getInstance();

// Mock wallet interface for the server
interface MockWalletData {
  address: string;
  username: string;
  lastAccessed: number;
  createdAt: number;
}

// Mock data for the server API
const mockWallets: MockWalletData[] = [
  {
    address: '0x1234567890123456789012345678901234567890',
    username: 'Demo Wallet',
    lastAccessed: Date.now() - 86400000, // 1 day ago
    createdAt: Date.now() - 604800000, // 1 week ago
  }
];

export async function GET() {
  try {
    // Return mock data for server deployment
    console.log('[SERVER] Returning mock wallet list');
    return NextResponse.json(mockWallets);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, owner, password } = body;
    
    if (!name || !owner || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      // Generate a new wallet - this can work server-side
      const newWallet = evmWalletService.createWallet();
      
      // For server deployment, just return the created wallet info
      // without storing it (since we don't have client storage)
      return NextResponse.json({
        address: newWallet.address,
        name,
        owner,
        message: 'Wallet created (preview only - not stored in server environment)'
      }, { status: 201 });
    } catch (error) {
      console.error('Failed to create account:', error);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to parse request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    
    // For server deployment, just acknowledge the request
    return NextResponse.json({ 
      message: 'Account deletion acknowledged (preview only - no actual deletion in server environment)',
      address 
    });
  } catch (error) {
    console.error('Failed to delete account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
} 