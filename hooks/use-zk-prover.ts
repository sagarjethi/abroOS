import { useState, useCallback } from 'react';
import { ZKBridgeService } from '@/lib/services/zk-bridge';
import type { KeystrokePattern, ZKProof } from '@/lib/zk-prover-init';

export function useZKProver() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectKeystrokePatterns = useCallback(async (deltas: number[]): Promise<KeystrokePattern> => {
    setIsLoading(true);
    setError(null);
    try {
      const pattern = await ZKBridgeService.getInstance().collectKeystrokePatterns(deltas);
      return pattern;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to collect keystroke patterns');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateHumanTypingProof = useCallback(async (
    content: string,
    pattern: KeystrokePattern
  ): Promise<ZKProof> => {
    setIsLoading(true);
    setError(null);
    try {
      const proof = await ZKBridgeService.getInstance().generateHumanTypingProof(content, pattern);
      return proof;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proof');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyProofOnChain = useCallback(async (proof: ZKProof): Promise<{ verified: boolean }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await ZKBridgeService.getInstance().verifyProofOnChain(proof);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify proof');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    collectKeystrokePatterns,
    generateHumanTypingProof,
    verifyProofOnChain,
  };
} 