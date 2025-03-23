'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useZKProver } from '@/hooks/use-zk-prover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ZKProof } from '@/lib/zk-prover-init';

interface ZKProverServiceProps {
  content: string;
  keystrokeDeltas: number[];
  onProofGenerated?: (proof: ZKProof) => void;
  onProofVerified?: (verified: boolean) => void;
}

export function ZKProverService({
  content,
  keystrokeDeltas,
  onProofGenerated,
  onProofVerified,
}: ZKProverServiceProps) {
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    isLoading,
    error,
    collectKeystrokePatterns,
    generateHumanTypingProof,
    verifyProofOnChain,
  } = useZKProver();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  useEffect(() => {
    // Initialize the ZK prover when the component mounts
    const initZKProver = async () => {
      try {
        await collectKeystrokePatterns([]); // This will trigger initialization
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize ZK prover:', err);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize ZK prover. Please try again.',
          variant: 'destructive',
        });
      }
    };

    initZKProver();
  }, [collectKeystrokePatterns]);

  const handleGenerateProof = async () => {
    if (!isInitialized) {
      toast({
        title: 'Not Ready',
        description: 'ZK prover is still initializing. Please wait.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const pattern = await collectKeystrokePatterns(keystrokeDeltas);
      const generatedProof = await generateHumanTypingProof(content, pattern);
      setProof(generatedProof);
      onProofGenerated?.(generatedProof);
      
      toast({
        title: 'Success',
        description: 'ZK proof generated successfully',
      });
    } catch (err) {
      console.error('Failed to generate proof:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate ZK proof. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerifyProof = async () => {
    if (!proof) return;

    try {
      const result = await verifyProofOnChain(proof);
      setIsVerified(result.verified);
      onProofVerified?.(result.verified);
      
      toast({
        title: 'Verification Result',
        description: result.verified ? 'Proof verified successfully' : 'Proof verification failed',
        variant: result.verified ? 'default' : 'destructive',
      });
    } catch (err) {
      console.error('Failed to verify proof:', err);
      toast({
        title: 'Error',
        description: 'Failed to verify proof. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleGenerateProof}
          disabled={isLoading || !isInitialized || !content || keystrokeDeltas.length === 0}
        >
          {isLoading ? 'Generating...' : isInitialized ? 'Generate ZK Proof' : 'Initializing...'}
        </Button>
        
        {proof && (
          <Button
            onClick={handleVerifyProof}
            disabled={isLoading || isVerified !== null}
            variant="secondary"
          >
            {isLoading ? 'Verifying...' : 'Verify Proof'}
          </Button>
        )}
      </div>

      {proof && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Proof Status:</span>
            <Badge variant={isVerified ? 'success' : 'secondary'}>
              {isVerified === null ? 'Pending Verification' : isVerified ? 'Verified' : 'Failed'}
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Pattern Hash: {proof.pattern_hash}</p>
            <p>Timestamp: {new Date(proof.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
} 