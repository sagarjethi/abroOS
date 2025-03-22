import { NextResponse } from 'next/server';
import { initZKProver } from '@/lib/zk-prover-init';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.keystrokeDeltas || !Array.isArray(data.keystrokeDeltas)) {
      return NextResponse.json(
        { error: 'Invalid request: keystrokeDeltas must be an array' },
        { status: 400 }
      );
    }
    
    const zkProver = await initZKProver();
    const result = zkProver.collect_keystroke_patterns(data.keystrokeDeltas);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error collecting keystroke patterns:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while collecting keystroke patterns' },
      { status: 500 }
    );
  }
} 