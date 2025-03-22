"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Shield,
  X,
  FileDown,
  Terminal,
  FileText,
  GanttChart,
  BarChart,
} from "lucide-react";
import {
  collectKeystrokePatterns,
  generateHumanTypingProof,
  verifyProofOnChain,
  exportProofData,
  KeystrokePattern,
  ZKHumanTypingProof
} from "@/components/zk-prover/ZKProverService";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofData, setProofData] = useState<ZKHumanTypingProof | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; txHash: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Reset states when modal is opened
  useEffect(() => {
    if (isOpen) {
      if (!isGenerating && !isVerifying) {
        setError(null);
        setCopiedField(null);
      }
    }
  }, [isOpen, isGenerating, isVerifying]);
  
  // Helper function to copy text to clipboard
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  // Helper function to truncate long strings
  const truncateString = (str: string, maxLength: number = 20) => {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength / 2)}...${str.substring(
      str.length - maxLength / 2
    )}`;
  };

  // Generate the ZK proof using the keystroke data
  const handleGenerateProof = async () => {
    if (keystrokeDeltas.length < 20) {
      setError("Not enough keystroke data to generate a valid proof");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setProofData(null);
      setVerificationResult(null);
      
      // Collect typing patterns from keystroke data
      const patterns = collectKeystrokePatterns(keystrokeDeltas);
      
      // Generate the ZK proof
      const proof = await generateHumanTypingProof(content, patterns);
      
      setProofData(proof);
      setActiveTab("details");
    } catch (err: any) {
      setError(err.message || "Failed to generate proof");
      console.error("Proof generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Verify the proof on-chain
  const handleVerifyOnChain = async () => {
    if (!proofData) {
      setError("No proof data available to verify");
      return;
    }
    
    try {
      setIsVerifying(true);
      setError(null);
      
      // Simulate on-chain verification
      const result = await verifyProofOnChain(proofData);
      
      setVerificationResult(result);
      setActiveTab("verification");
    } catch (err: any) {
      setError(err.message || "Failed to verify proof on-chain");
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Export the proof as a JSON file
  const handleExportProof = () => {
    if (!proofData) {
      setError("No proof data available to export");
      return;
    }
    
    try {
      exportProofData(proofData, `zk-typing-proof-${contentId}.json`);
    } catch (err: any) {
      setError(err.message || "Failed to export proof");
      console.error("Export error:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            ZK Human Typing Verification
          </DialogTitle>
          <DialogDescription>
            Generate a zero-knowledge proof that verifies this content was written by a human
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details" disabled={!proofData}>Details</TabsTrigger>
            <TabsTrigger value="verification" disabled={!verificationResult}>Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Human Verification Process</CardTitle>
                <CardDescription>
                  This process uses zero-knowledge proofs to verify human authorship
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <GanttChart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Keystroke Pattern Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Your typing patterns are analyzed for human-like characteristics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Terminal className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">ZK Proof Generation</h3>
                    <p className="text-sm text-muted-foreground">
                      A zero-knowledge proof is generated that proves human typing without revealing the actual patterns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">On-Chain Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      The proof can be verified on-chain for permanent, tamper-proof verification
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                {keystrokeDeltas.length < 20 ? (
                  <div className="text-amber-500 text-sm">
                    Not enough keystroke data ({keystrokeDeltas.length}/20 required)
                  </div>
                ) : (
                  <div className="text-green-500 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    {keystrokeDeltas.length} keystrokes recorded
                  </div>
                )}
                <Button 
                  onClick={handleGenerateProof} 
                  disabled={isGenerating || keystrokeDeltas.length < 20}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Proof</>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center text-amber-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Why Verify Your Content?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-2">
                  In the age of AI-generated content, proving your work was written by a human brings several benefits:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>Establish credibility and authenticity for your writing</li>
                  <li>Differentiate your content from AI-generated text</li>
                  <li>Create an immutable proof of human authorship</li>
                  <li>Build trust with readers who value human-created content</li>
                </ul>
                <div className="mt-3 text-sm text-amber-600">
                  <strong>Remember:</strong> Verification takes just a few seconds, but provides lasting proof of your content&apos;s authenticity.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {proofData && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>Proof Information</span>
                      {proofData.publicValues.humanVerified ? (
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified Human
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive">
                          <X className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-sm font-medium">Content Hash</h4>
                        <div className="mt-1 flex items-center">
                          <code className="bg-muted text-xs p-1 rounded flex-1 overflow-hidden">
                            {truncateString(proofData.publicValues.contentHash, 20)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={() => handleCopy(proofData.publicValues.contentHash, "contentHash")}
                          >
                            {copiedField === "contentHash" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Timestamp</h4>
                        <p className="text-sm mt-1">
                          {new Date(proofData.publicValues.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Verification Data</h4>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="bg-muted p-2 rounded text-center">
                          <p className="text-xs text-muted-foreground">Word Count</p>
                          <p className="text-lg font-medium">{proofData.verificationData.wordCount}</p>
                        </div>
                        <div className="bg-muted p-2 rounded text-center">
                          <p className="text-xs text-muted-foreground">Avg. Keystroke (ms)</p>
                          <p className="text-lg font-medium">
                            {Math.round(proofData.verificationData.averageKeystrokeTime)}
                          </p>
                        </div>
                        <div className="bg-muted p-2 rounded text-center">
                          <p className="text-xs text-muted-foreground">Edit Time (s)</p>
                          <p className="text-lg font-medium">
                            {Math.round(proofData.verificationData.totalEditingTime / 1000)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t pt-4">
                    <Button variant="outline" onClick={handleExportProof}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Proof
                    </Button>
                    <Button 
                      onClick={handleVerifyOnChain}
                      disabled={isVerifying || !proofData.publicValues.humanVerified}
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify On-Chain
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {verificationResult && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    On-Chain Verification Status
                  </CardTitle>
                  <CardDescription>
                    This verification result is publicly available on the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-6">
                    {verificationResult.verified ? (
                      <div className="bg-green-500/10 p-4 rounded-full">
                        <Check className="h-12 w-12 text-green-500" />
                      </div>
                    ) : (
                      <div className="bg-destructive/10 p-4 rounded-full">
                        <X className="h-12 w-12 text-destructive" />
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted p-3 rounded flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Transaction Hash</span>
                    </div>
                    <div className="flex items-center">
                      <code className="text-xs bg-background p-1 rounded">
                        {truncateString(verificationResult.txHash, 30)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => handleCopy(verificationResult.txHash, "txHash")}
                      >
                        {copiedField === "txHash" ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-center text-sm">
                    <p>
                      {verificationResult.verified
                        ? "This document has been verified as human-written with ZK proofs."
                        : "This document could not be verified as human-written."}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                  <Button variant="outline" onClick={handleExportProof}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Verification
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 