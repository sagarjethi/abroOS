import initWasm, { ZKProver } from '../zk-prover/pkg/zk_prover';

let zkProverInstance: ZKProver | null = null;
let isInitializing = false;
let initPromise: Promise<ZKProver> | null = null;

/**
 * Initializes the ZK prover WASM module and returns a singleton instance.
 * This function ensures that the module is only initialized once.
 */
export async function initZKProver(): Promise<ZKProver> {
  // If we already have an instance, return it
  if (zkProverInstance) {
    return zkProverInstance;
  }

  // If initialization is in progress, wait for it to complete
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // Start initialization
  isInitializing = true;
  
  initPromise = (async () => {
    try {
      console.log('Initializing ZK Prover WASM module...');
      
      // Initialize the WASM module
      await initWasm();
      
      // Create a new instance of the ZKProver
      zkProverInstance = new ZKProver();
      
      console.log('ZK Prover WASM module initialized successfully');
      
      return zkProverInstance;
    } catch (error) {
      console.error('Failed to initialize ZK Prover WASM module:', error);
      isInitializing = false;
      throw error;
    } finally {
      isInitializing = false;
    }
  })();
  
  return initPromise;
}

/**
 * Type definitions for the ZK prover module.
 * These should match the interface exposed by the Rust WASM module.
 */
export interface KeystrokePattern {
  keystroke_deltas: number[];
  total_time: number;
  key_count: number;
}

export interface ZKProof {
  pattern_hash: string;
  timestamp: number;
  signature: string;
}

export interface PublicValues {
  content_hash: string;
  authority_hash: string;
  human_verified: boolean;
  timestamp: number;
}

export interface VerificationData {
  word_count: number;
  average_keystroke_time: number;
  total_editing_time: number;
} 