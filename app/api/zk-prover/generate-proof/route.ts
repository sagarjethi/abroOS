import { NextResponse } from 'next/server';
import { initZKProver } from '@/lib/zk-prover-init';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.content || typeof data.content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: content must be a string' },
        { status: 400 }
      );
    }
    
    if (!data.keystrokePattern || typeof data.keystrokePattern !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: keystrokePattern must be an object' },
        { status: 400 }
      );
    }
    
    const zkProver = await initZKProver();
    const result = zkProver.generate_human_typing_proof(data.content, data.keystrokePattern);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating ZK proof:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating the ZK proof' },
      { status: 500 }
    );
  }
} 