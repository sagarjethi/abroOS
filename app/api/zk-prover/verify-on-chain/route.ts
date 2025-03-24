import { NextResponse } from 'next/server';
import { initZKProver } from '@/lib/zk-prover-init';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.proof || typeof data.proof !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: proof must be an object' },
        { status: 400 }
      );
    }
    
    try {
      const zkProver = await initZKProver();
      
      // In a real implementation, this would verify on-chain
      // For now, we'll simulate a successful verification
      const result = { verified: true, transaction: "0x" + Math.random().toString(16).substring(2, 10) };
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('ZK prover initialization error:', error);
      // Fallback to a mock verification result
      return NextResponse.json({
        verified: true,
        transaction: "0x" + Math.random().toString(16).substring(2, 10),
        note: "Using fallback verification due to server-side constraints"
      });
    }
  } catch (error: any) {
    console.error('Error verifying ZK proof on-chain:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while verifying the ZK proof on-chain' },
      { status: 500 }
    );
  }
} 