"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  collectKeystrokePatterns,
  generateHumanTypingProof,
  verifyProofOnChain,
  exportProofData,
  type ZKHumanTypingProof
} from "@/lib/services/zk-prover-service";
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface ZKTypingProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  content: string;
  keystrokeDeltas: number[];
}

export function ZKTypingProofModal({
  isOpen,
  onClose,
  contentId,
  content,
  keystrokeDeltas,
}: ZKTypingProofModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState<ZKHumanTypingProof | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Reset states when modal is opened
  useEffect(() => {
    if (isOpen) {
      setProof(null);
      setProgress(0);
    }
  }, [isOpen]);

  // Generate the ZK proof using the keystroke data
  const handleGenerateProof = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      
      // Collect keystroke patterns
      const patterns = collectKeystrokePatterns(keystrokeDeltas);
      setProgress(30);
      
      // Generate the proof
      const newProof = await generateHumanTypingProof(content, patterns);
      setProgress(60);
      
      // Verify the proof on-chain
      const { verified, txHash } = await verifyProofOnChain(newProof);
      setProgress(100);
      
      if (verified) {
        setProof(newProof);
        toast({
          title: "Proof Generated Successfully",
          description: `Transaction hash: ${txHash}`,
        });
        
        // Export the proof data
        exportProofData(newProof, `human-typing-proof-${Date.now()}.json`);
      } else {
        toast({
          title: "Proof Generation Failed",
          description: "The proof could not be verified as human-typed content.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating proof:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate proof",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Human Typing Proof</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Content Hash</h3>
            <p className="text-sm text-muted-foreground break-all">
              {proof?.publicValues.content_hash || 'Not generated yet'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Verification Status</h3>
            <p className="text-sm text-muted-foreground">
              {proof?.publicValues.human_verified ? 'Verified as Human-Typed' : 'Not Verified'}
            </p>
          </div>
          
          {proof && (
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-medium">Word Count</h3>
                <p className="text-sm text-muted-foreground">
                  {proof.verificationData.word_count} words
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Average Keystroke Time</h3>
                <p className="text-sm text-muted-foreground">
                  {proof.verificationData.average_keystroke_time.toFixed(2)}ms
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Total Editing Time</h3>
                <p className="text-sm text-muted-foreground">
                  {proof.verificationData.total_editing_time}ms
                </p>
              </div>
            </div>
          )}
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Generating proof... {progress}%
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={handleGenerateProof}
              disabled={isGenerating || !content || keystrokeDeltas.length < 20}
            >
              {isGenerating ? 'Generating...' : 'Generate Proof'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 