import { NextResponse } from 'next/server';
import { initZKProver } from '@/lib/zk-prover-init';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.proof || typeof data.proof !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: proof must be an object' },
        { status: 400 }
      );
    }
    
    const zkProver = await initZKProver();
    const result = zkProver.verify_proof_on_chain(data.proof);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error verifying ZK proof on-chain:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while verifying the ZK proof on-chain' },
      { status: 500 }
    );
  }
} 