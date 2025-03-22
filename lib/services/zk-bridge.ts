import { KeystrokePattern, ZKProof } from '@/lib/zk-prover-init';
import { ZKHumanTypingProof } from '@/components/zk-prover/ZKProverService';

/**
 * Types for image editing proof generation
 */
export interface ImageTransformation {
  Crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  Grayscale?: {
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
  Rotate90?: null;
  Rotate180?: null;
  Rotate270?: null;
  FlipVertical?: {
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
  FlipHorizontal?: {
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
  Brighten?: {
    value: number;
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
  Contrast?: {
    contrast: number;
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
  Blur?: {
    sigma: number;
    region: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
  TextOverlay?: {
    text: string;
    x: number;
    y: number;
    size: number;
    color: string;
  };
}

export interface ImageProofRequest {
  image_data: number[];
  id: string;
  transformations: ImageTransformation[];
  signature_data?: {
    signature: string;
    public_key: string;
  };
}

export interface ImageProofResponse {
  success: boolean;
  message: string;
  final_image: number[];
  original_image_hash: string;
  transformed_image_hash: string;
  signer_public_key: string;
  has_signature: boolean;
  proof_data: {
    proof: string;
    verification_key: string;
    public_values: string;
  };
}

export interface TextProofRequest {
  content: string;
  keystrokePattern: KeystrokePattern;
}

export interface TextProofResponse {
  proof: string;
  publicValues: {
    contentHash: string;
    authorityHash: string;
    humanVerified: boolean;
    timestamp: number;
  };
  verificationData: {
    wordCount: number;
    averageKeystrokeTime: number;
    totalEditingTime: number;
  };
}

/**
 * Generate a ZK proof for image transformations using the ZKEditor API
 */
export async function generateImageProof(
  request: ImageProofRequest
): Promise<ImageProofResponse> {
  try {
    const response = await fetch('/api/zk-editor/generate-proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image proof');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error generating image proof:', error);
    throw error;
  }
}

/**
 * Generate a ZK proof for human typing using the ZK prover API
 */
export async function generateTextProof(
  request: TextProofRequest
): Promise<ZKHumanTypingProof> {
  try {
    const response = await fetch('/api/zk-prover/generate-proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate text proof');
    }

    const result: ZKProof = await response.json();
    
    // Convert the Rust WASM proof format to the frontend format
    return {
      proof: result.proof_data,
      publicValues: {
        contentHash: result.public_values.content_hash,
        authorityHash: result.public_values.authority_hash,
        humanVerified: result.public_values.human_verified,
        timestamp: result.public_values.timestamp,
      },
      verificationData: {
        wordCount: result.verification_data.word_count,
        averageKeystrokeTime: result.verification_data.average_keystroke_time,
        totalEditingTime: result.verification_data.total_editing_time,
      }
    };
  } catch (error: any) {
    console.error('Error generating text proof:', error);
    throw error;
  }
}

/**
 * Verify a ZK proof for image transformations on-chain
 */
export async function verifyImageProofOnChain(
  proofData: {
    proof: string;
    publicValues: string;
  }
): Promise<{ verified: boolean; txHash: string }> {
  try {
    const response = await fetch('/api/zk-editor/verify-proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof: proofData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify image proof on-chain');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error verifying image proof on-chain:', error);
    throw error;
  }
}

/**
 * Verify a ZK proof for human typing on-chain
 */
export async function verifyTextProofOnChain(
  proof: ZKHumanTypingProof
): Promise<{ verified: boolean; txHash: string }> {
  try {
    // Convert the frontend proof format to the API format
    const rustProofFormat: ZKProof = {
      proof_data: proof.proof,
      public_values: {
        content_hash: proof.publicValues.contentHash,
        authority_hash: proof.publicValues.authorityHash,
        human_verified: proof.publicValues.humanVerified,
        timestamp: proof.publicValues.timestamp,
      },
      verification_data: {
        word_count: proof.verificationData.wordCount,
        average_keystroke_time: proof.verificationData.averageKeystrokeTime,
        total_editing_time: proof.verificationData.totalEditingTime,
      }
    };
    
    const response = await fetch('/api/zk-prover/verify-on-chain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proof: rustProofFormat
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify text proof on-chain');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error verifying text proof on-chain:', error);
    throw error;
  }
}

/**
 * Helper function to convert array of numbers to image URL
 */
export function arrayToImageUrl(imageData: number[]): string {
  const uint8Array = new Uint8Array(imageData);
  const blob = new Blob([uint8Array], { type: "image/jpeg" });
  return URL.createObjectURL(blob);
} 