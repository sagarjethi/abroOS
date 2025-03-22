import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Image, Check, Loader2, X } from 'lucide-react';
import { ZKHumanTypingProof } from '@/components/zk-prover/ZKProverService';
import { generateTextProof, verifyTextProofOnChain, generateImageProof, verifyImageProofOnChain, ImageProofResponse } from '@/lib/services/zk-bridge';
import { KeystrokePattern } from '@/lib/zk-prover-init';

interface ZKProofServiceProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'text' | 'image';
  content: string | Blob;
  keystrokePatterns?: KeystrokePattern;
  imageTransformations?: any[];
}

export default function ZKProofService({
  isOpen,
  onClose,
  contentType,
  content,
  keystrokePatterns,
  imageTransformations
}: ZKProofServiceProps) {
  const [activeTab, setActiveTab] = useState<string>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [textProof, setTextProof] = useState<ZKHumanTypingProof | null>(null);
  const [imageProof, setImageProof] = useState<ImageProofResponse | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset the state when the dialog is closed
  const handleClose = () => {
    setActiveTab('generate');
    setIsGenerating(false);
    setIsVerifying(false);
    setTextProof(null);
    setImageProof(null);
    setVerificationResult(null);
    setErrorMessage(null);
    onClose();
  };

  // Generate a proof based on the content type
  const handleGenerateProof = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      if (contentType === 'text' && typeof content === 'string' && keystrokePatterns) {
        // Generate text proof
        const proof = await generateTextProof({
          content,
          keystrokePattern: keystrokePatterns,
        });
        
        setTextProof(proof);
      } else if (contentType === 'image' && content instanceof Blob && imageTransformations && imageTransformations.length > 0) {
        // Convert blob to array buffer for the API
        const arrayBuffer = await content.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageData = Array.from(uint8Array);
        
        // Generate image proof
        const proof = await generateImageProof({
          image_data: imageData,
          id: `image_${Date.now()}`,
          transformations: imageTransformations,
        });
        
        setImageProof(proof);
      } else {
        throw new Error('Invalid content type or missing required data');
      }
      
      // Switch to the verify tab after successful generation
      setActiveTab('verify');
    } catch (error: any) {
      console.error('Error generating proof:', error);
      setErrorMessage(error.message || 'An error occurred while generating the proof');
    } finally {
      setIsGenerating(false);
    }
  };

  // Verify a proof on-chain
  const handleVerifyProof = async () => {
    setIsVerifying(true);
    setErrorMessage(null);
    
    try {
      if (contentType === 'text' && textProof) {
        // Verify text proof
        const result = await verifyTextProofOnChain(textProof);
        setVerificationResult(result);
      } else if (contentType === 'image' && imageProof) {
        // Verify image proof
        const result = await verifyImageProofOnChain({
          proof: imageProof.proof_data.proof,
          publicValues: imageProof.proof_data.public_values,
        });
        setVerificationResult(result);
      } else {
        throw new Error('No proof to verify');
      }
    } catch (error: any) {
      console.error('Error verifying proof:', error);
      setErrorMessage(error.message || 'An error occurred while verifying the proof');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const renderProofDetails = () => {
    if (contentType === 'text' && textProof) {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Content Hash:</span>
            <span className="font-mono truncate max-w-[300px]">{textProof.publicValues.contentHash}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Human Verified:</span>
            <Badge variant={textProof.publicValues.humanVerified ? "success" : "destructive"}>
              {textProof.publicValues.humanVerified ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Word Count:</span>
            <span>{textProof.verificationData.wordCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Avg. Keystroke Time:</span>
            <span>{textProof.verificationData.averageKeystrokeTime.toFixed(2)}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Editing Time:</span>
            <span>{(textProof.verificationData.totalEditingTime / 1000).toFixed(2)}s</span>
          </div>
        </div>
      );
    } else if (contentType === 'image' && imageProof) {
      return (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Original Image Hash:</span>
            <span className="font-mono truncate max-w-[300px]">{imageProof.original_image_hash}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Transformed Image Hash:</span>
            <span className="font-mono truncate max-w-[300px]">{imageProof.transformed_image_hash}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Has Signature:</span>
            <Badge variant={imageProof.has_signature ? "success" : "default"}>
              {imageProof.has_signature ? "Yes" : "No"}
            </Badge>
          </div>
          {imageProof.has_signature && (
            <div className="flex justify-between items-center">
              <span className="font-semibold">Signer:</span>
              <span className="font-mono truncate max-w-[300px]">{imageProof.signer_public_key}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="font-semibold">Transformations:</span>
            <span>{imageTransformations?.length || 0}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  const renderVerificationResult = () => {
    if (!verificationResult) return null;
    
    return (
      <div className="space-y-2 mt-4">
        <div className="flex justify-center items-center">
          {verificationResult.verified ? (
            <Badge className="px-3 py-1" variant="success">
              <Check className="w-4 h-4 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge className="px-3 py-1" variant="destructive">
              <X className="w-4 h-4 mr-1" />
              Not Verified
            </Badge>
          )}
        </div>
        
        {verificationResult.txHash && (
          <div className="flex justify-between items-center mt-2">
            <span className="font-semibold">Transaction Hash:</span>
            <span className="font-mono truncate max-w-[300px]">{verificationResult.txHash}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            ZK Proof Service
          </DialogTitle>
          <DialogDescription>
            {contentType === 'text' 
              ? 'Generate and verify zero-knowledge proofs for human-typed content.'
              : 'Generate and verify zero-knowledge proofs for image transformations.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate" disabled={isGenerating}>
              Generate Proof
            </TabsTrigger>
            <TabsTrigger value="verify" disabled={isVerifying || (!textProof && !imageProof)}>
              Verify On-Chain
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {contentType === 'text' ? (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Human Typing Proof
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5 mr-2" />
                      Image Transformation Proof
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {contentType === 'text'
                    ? 'Generate a zero-knowledge proof that this content was typed by a human.'
                    : 'Generate a zero-knowledge proof of image transformations.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {(textProof || imageProof) ? (
                  renderProofDetails()
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      {contentType === 'text'
                        ? 'Generate a proof to verify that this content was typed by a human.'
                        : 'Generate a proof to verify the authenticity of image transformations.'}
                    </p>
                  </div>
                )}
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleGenerateProof}
                  disabled={isGenerating || (
                    contentType === 'text' 
                      ? !keystrokePatterns 
                      : (!imageTransformations || imageTransformations.length === 0)
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Proof'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="verify" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  On-Chain Verification
                </CardTitle>
                <CardDescription>
                  Submit the proof to be verified on blockchain.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {renderProofDetails()}
                {renderVerificationResult()}
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleVerifyProof}
                  disabled={isVerifying || (!textProof && !imageProof) || !!verificationResult}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify On-Chain'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 