import init, { ZKProver } from '@/zk-prover/pkg/zk_prover';
import type { KeystrokePattern, ZKProof } from '@/lib/zk-prover-init';

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

export class ZKBridgeService {
  private static instance: ZKBridgeService;
  private prover: ZKProver | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): ZKBridgeService {
    if (!ZKBridgeService.instance) {
      ZKBridgeService.instance = new ZKBridgeService();
    }
    return ZKBridgeService.instance;
  }

  private async initProver(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    if (this.isInitializing) {
      this.initPromise = new Promise((resolve, reject) => {
        const checkInitialization = () => {
          if (!this.isInitializing) {
            if (this.prover) {
              resolve();
            } else {
              reject(new Error('Failed to initialize ZK prover'));
            }
          } else {
            setTimeout(checkInitialization, 100);
          }
        };
        checkInitialization();
      });
      return this.initPromise;
    }

    this.isInitializing = true;
    try {
      await init();
      this.prover = new ZKProver();
    } catch (error) {
      this.initPromise = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  public async collectKeystrokePatterns(deltas: number[]): Promise<KeystrokePattern> {
    await this.initProver();
    if (!this.prover) throw new Error('Failed to initialize ZK prover');

    const pattern = await this.prover.collect_keystroke_patterns(deltas);
    return {
      keystroke_deltas: pattern.keystroke_deltas,
      total_time: pattern.total_time,
      key_count: pattern.key_count,
    };
  }

  public async generateHumanTypingProof(
    content: string,
    pattern: KeystrokePattern
  ): Promise<ZKProof> {
    await this.initProver();
    if (!this.prover) throw new Error('Failed to initialize ZK prover');

    const proof = await this.prover.generate_human_typing_proof(content, pattern);
    return {
      pattern_hash: proof.pattern_hash,
      timestamp: proof.timestamp,
      signature: proof.signature,
    };
  }

  public async verifyProofOnChain(proof: ZKProof): Promise<{ verified: boolean }> {
    await this.initProver();
    if (!this.prover) throw new Error('Failed to initialize ZK prover');

    const result = await this.prover.verify_proof_on_chain(proof);
    return { verified: result.verified };
  }
}

// Export a singleton instance
export const zkBridge = ZKBridgeService.getInstance();

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
): Promise<ZKProof> {
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
    return result;
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
  proof: ZKProof
): Promise<{ verified: boolean; txHash: string }> {
  try {
    const response = await fetch('/api/zk-prover/verify-on-chain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proof: proof
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