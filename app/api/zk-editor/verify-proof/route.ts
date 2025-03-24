import { NextResponse } from 'next/server';
import { sha256 } from 'js-sha256';

// Mock verification while actual on-chain verification is set up
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.proof || typeof data.proof !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: proof must be an object' },
        { status: 400 }
      );
    }
    
    if (!data.proof.proof || typeof data.proof.proof !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: proof.proof must be a string' },
        { status: 400 }
      );
    }
    
    if (!data.proof.publicValues || typeof data.proof.publicValues !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: proof.publicValues must be a string' },
        { status: 400 }
      );
    }
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a simulated transaction hash based on proof data
    const txHash = `0x${sha256(data.proof.proof).substring(0, 40)}`;
    
    // Parse public values to extract verification info
    let publicValues;
    try {
      publicValues = JSON.parse(data.proof.publicValues);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid public values: not a valid JSON string' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      verified: true,
      txHash,
      originalImageHash: publicValues.original_image_hash,
      transformedImageHash: publicValues.transformed_image_hash,
      signerPublicKey: publicValues.signer_public_key,
      hasSignature: publicValues.has_signature
    });
  } catch (error: any) {
    console.error('Error verifying image proof:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while verifying the image proof' },
      { status: 500 }
    );
  }
} 