import { NextResponse } from 'next/server';
import init, { ZKProver } from '@/zk-prover/pkg/zk_prover';

// Initialize WASM module
let prover: ZKProver | null = null;

async function getProver() {
  if (!prover) {
    await init();
    prover = new ZKProver();
  }
  return prover;
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, keystrokePattern } = body;

    if (!content || !keystrokePattern) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prover = await getProver();
    const proof = await prover.generate_human_typing_proof(content, keystrokePattern);

    return NextResponse.json({ proof });
  } catch (error) {
    console.error('Error generating ZK proof:', error);
    return NextResponse.json(
      { error: 'Failed to generate ZK proof' },
      { status: 500 }
    );
  }
} 