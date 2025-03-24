import { NextRequest, NextResponse } from 'next/server';
import { evmWalletService } from '../../../lib/wallet/wallet-service';
import { 
  SignMessageHistoryItem, 
  addSignedMessage 
} from '../../../lib/wallet/signed-messages-store';

// Remove client-side WalletStorageService dependency
// Instead, we'll use a mock implementation for the server API

// Simple in-memory wallet store for the server API
type ServerWallet = {
  address: string;
  encryptedWallet: string;
};

// This is a simplified version that will return mock data for the server
// In a production environment, you'd connect to a database here
async function getServerWalletByAddress(address: string): Promise<ServerWallet | null> {
  // For development/preview only - return a mock response
  // This allows the API to function during preview deployments
  console.log(`[SERVER] Mock wallet lookup for address: ${address}`);
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, address, signerAddress, domainUrl, sessionId, password, encryptedWallet } = body;

    if (!message || !address || !signerAddress || !password) {
      return NextResponse.json({ 
        error: 'Message, address, signer address, and password are required' 
      }, { status: 400 });
    }

    // For server API, we require the encrypted wallet to be sent in the request
    // This avoids needing to access client-side storage
    if (!encryptedWallet) {
      return NextResponse.json({ 
        error: 'Encrypted wallet data required for server-side signing' 
      }, { status: 400 });
    }
    
    try {
      // Decrypt the wallet using the provided password and encrypted wallet data
      const decryptedWallet = evmWalletService.decryptWallet(encryptedWallet, password);
      
      if (!decryptedWallet) {
        return NextResponse.json({ 
          error: 'Invalid password or corrupted wallet data' 
        }, { status: 401 });
      }
      
      // Verify the wallet address matches
      if (decryptedWallet.address.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json({ 
          error: 'Wallet address mismatch' 
        }, { status: 403 });
      }
      
      // Sign the message using ethers
      const signature = await decryptedWallet.signMessage(message);
      
      // Store the signing history (note: this is in-memory only)
      const signedMessage: SignMessageHistoryItem = {
        message,
        signer: signerAddress,
        domainUrl: domainUrl || 'unknown',
        signature,
        sessionId: sessionId || null,
        createdAt: new Date().toISOString()
      };
      
      // Use our shared store module to add the signed message
      addSignedMessage(address, signedMessage);
      
      return NextResponse.json({ 
        signature, 
        address 
      });
    } catch (error) {
      console.error('Signing error:', error);
      return NextResponse.json({ 
        error: 'Failed to sign message', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Signing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 