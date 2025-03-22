"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Check, 
  Loader2, 
  Shield, 
  FileDigit, 
  Save,
  Download,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Image,
  Link,
  FileCheck
} from "lucide-react";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ZKTypingProofModal } from "./ZKTypingProofModal";
import { collectKeystrokePatterns } from "@/components/zk-prover/ZKProverService";

interface ZKHumanTypingEditorProps {
  fileId?: string;
  initialContent?: string;
}

export const ZKHumanTypingEditor: React.FC<ZKHumanTypingEditorProps> = ({
  fileId,
  initialContent = "",
}) => {
  const { updateItemContent, getItemContent } = useFileSystem();
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number | null>(null);
  const [keystrokeDeltas, setKeystrokeDeltas] = useState<number[]>([]);
  const [proofStatus, setProofStatus] = useState<
    "idle" | "collecting" | "analyzing" | "verified" | "failed"
  >("idle");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [showProofModal, setShowProofModal] = useState(false);
  const [humanScore, setHumanScore] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileId) {
      setIsLoading(true);
      getItemContent(fileId)
        .then((content) => {
          if (content !== undefined) {
            // Check if the content has a ZK verification header
            if (content.includes('<!-- ZK-VERIFIED:')) {
              setIsVerified(true);
              setProofStatus("verified");
              setHumanScore(100);
              
              // Extract the content without the verification header
              const contentWithoutHeader = content.replace(/<!-- ZK-VERIFIED: \d+ -->\n/, '');
              setContent(contentWithoutHeader);
              if (editorRef.current) {
                editorRef.current.innerHTML = contentWithoutHeader;
              }
            } else {
              setContent(content);
              if (editorRef.current) {
                editorRef.current.innerHTML = content;
              }
            }
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [fileId, getItemContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const now = Date.now();
    if (lastKeystrokeTime) {
      const delta = now - lastKeystrokeTime;
      setKeystrokeDeltas(prev => [...prev, delta]);
    }
    setLastKeystrokeTime(now);
    
    // Update human score based on keystroke data
    if (keystrokeDeltas.length > 10) {
      // Calculate a simple human score based on keystroke variance
      const avg = keystrokeDeltas.reduce((a, b) => a + b, 0) / keystrokeDeltas.length;
      const variance = keystrokeDeltas.map(d => Math.pow(d - avg, 2)).reduce((a, b) => a + b, 0) / keystrokeDeltas.length;
      
      // Map variance to a 0-100 score (very simplified)
      const normalizedScore = Math.min(100, Math.max(0, variance / 10000 * 100));
      setHumanScore(Math.round(normalizedScore));
    }
    
    // After collecting enough keystrokes, update proof status
    if (keystrokeDeltas.length > 50 && proofStatus === "idle") {
      setProofStatus("collecting");
    } else if (keystrokeDeltas.length > 100 && proofStatus === "collecting") {
      setProofStatus("analyzing");
      analyzeTypingPatterns();
    }
  };

  // Analyze typing patterns to determine if they appear human
  const analyzeTypingPatterns = async () => {
    setIsAnalyzing(true);
    
    try {
      // In a real implementation, this would call the ZK prover service
      // For now, we'll simulate the analysis
      
      // Calculate timing statistics
      const avg = keystrokeDeltas.reduce((a, b) => a + b, 0) / keystrokeDeltas.length;
      const variance = keystrokeDeltas.map(d => Math.pow(d - avg, 2)).reduce((a, b) => a + b, 0) / keystrokeDeltas.length;
      
      console.log('Analyzing keystroke patterns:', {
        count: keystrokeDeltas.length,
        averageDelta: avg,
        variance: variance
      });
      
      // Delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if the variance is in a range typical for humans
      const isHumanTyping = variance > 5000 && variance < 500000;
      
      setIsVerified(isHumanTyping);
      setProofStatus(isHumanTyping ? "verified" : "failed");
    } catch (error) {
      console.error('Error analyzing typing patterns:', error);
      setProofStatus("failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
    }
    
    if (proofStatus === "verified" || proofStatus === "failed") {
      // Don't reset verification status if we're just making minor edits
      // In a real implementation, you'd want more sophisticated logic here
      if (keystrokeDeltas.length > 150) {
        // Reset only if substantial edits have been made
        setProofStatus("collecting");
        setIsVerified(false);
      }
    }
  };

  const handleSave = async () => {
    if (fileId && editorRef.current) {
      setIsLoading(true);
      try {
        const contentToSave = editorRef.current.innerHTML;
        
        // If the content has been verified, add a special metadata header
        if (isVerified) {
          const verifiedContent = `<!-- ZK-VERIFIED: ${Date.now()} -->\n${contentToSave}`;
          await updateItemContent(fileId, verifiedContent);
        } else {
          await updateItemContent(fileId, contentToSave);
        }
      } catch (error) {
        console.error("Error saving content:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDoc = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      // Ensure editor keeps focus
      editorRef.current.focus();
      // Update content state
      handleEditorChange();
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatDoc('insertImage', url);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatDoc('createLink', url);
    }
  };

  const openProofModal = () => {
    // Only allow opening proof modal if we have enough keystroke data
    if (keystrokeDeltas.length >= 20) {
      setShowProofModal(true);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-medium">ZK Human Typing Verifier</div>
        <div className="flex items-center gap-2">
          {proofStatus === "verified" && (
            <div className="flex items-center text-green-500 text-sm">
              <Shield className="w-4 h-4 mr-1" />
              Human-verified
            </div>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button 
            variant={keystrokeDeltas.length >= 100 && proofStatus !== "verified" && proofStatus !== "failed" ? "default" : "outline"}
            onClick={openProofModal}
            disabled={keystrokeDeltas.length < 20}
            className={keystrokeDeltas.length >= 100 && proofStatus !== "verified" && proofStatus !== "failed" ? "border-amber-500 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 hover:text-amber-600" : ""}
          >
            <FileCheck className={cn(
              "h-4 w-4 mr-2",
              keystrokeDeltas.length >= 100 && proofStatus !== "verified" && proofStatus !== "failed" ? "animate-pulse" : ""
            )} />
            {keystrokeDeltas.length >= 100 && proofStatus !== "verified" && proofStatus !== "failed" ? "Ready to Verify!" : "Verify Authorship"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="write" className="w-full" onValueChange={(v) => setActiveTab(v as "write" | "preview")}>
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="flex-grow flex gap-4">
          <div className="flex-grow flex flex-col">
            <div className="bg-muted p-1 rounded-md mb-2 flex flex-wrap gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('bold')}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('italic')}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('underline')}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Underline</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mx-1 h-8" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('formatBlock', 'h1')}
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 1</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('formatBlock', 'h2')}
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading 2</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mx-1 h-8" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('justifyLeft')}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Left</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('justifyCenter')}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Center</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('justifyRight')}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Align Right</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mx-1 h-8" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('insertUnorderedList')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bullet List</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => formatDoc('insertOrderedList')}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Numbered List</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mx-1 h-8" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={handleInsertImage}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={handleInsertLink}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Link</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="relative flex-grow">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                onKeyDown={handleKeyDown}
                className="h-full min-h-[400px] border rounded-md p-4 overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Add verification reminder tooltip */}
              {keystrokeDeltas.length >= 100 && proofStatus !== "verified" && proofStatus !== "failed" && !isAnalyzing && (
                <div className="absolute top-2 right-2 bg-amber-500/10 text-amber-500 px-3 py-2 rounded-md text-xs flex items-center border border-amber-500/20 animate-pulse">
                  <FileCheck className="h-3 w-3 mr-2" />
                  Ready for verification! Click &quot;Verify Authorship&quot; to prove this is human-written.
                </div>
              )}
              
              {isAnalyzing && (
                <div className="absolute top-2 right-2 bg-background/80 text-primary px-3 py-2 rounded-md text-xs flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Analyzing human typing patterns...
                </div>
              )}
              {proofStatus === "verified" && (
                <div className="absolute top-2 right-2 bg-green-500/10 text-green-500 px-3 py-2 rounded-md text-xs flex items-center">
                  <Shield className="h-3 w-3 mr-2" />
                  Human authorship verified
                </div>
              )}
            </div>
          </div>

          <Card className="w-64 p-4 flex flex-col">
            <h3 className="text-sm font-semibold mb-4">ZK Verification Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mr-2",
                    keystrokeDeltas.length > 20 ? "bg-green-500" : "bg-gray-300"
                  )}
                />
                <span className="text-sm">Keystroke collection</span>
              </div>
              
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mr-2",
                    proofStatus === "analyzing" || proofStatus === "verified" || proofStatus === "failed"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  )}
                />
                <span className="text-sm">Pattern analysis</span>
              </div>
              
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mr-2",
                    proofStatus === "verified" 
                      ? "bg-green-500" 
                      : proofStatus === "failed"
                      ? "bg-red-500"
                      : "bg-gray-300"
                  )}
                />
                <span className="text-sm">Proof verification</span>
              </div>
            </div>
            
            {/* Add remaining keystrokes counter */}
            {keystrokeDeltas.length < 100 && proofStatus !== "verified" && proofStatus !== "failed" && (
              <div className="mt-4 bg-muted p-3 rounded-md">
                <h4 className="text-xs font-medium mb-2">Verification Progress</h4>
                <div className="w-full bg-background rounded-full h-2 mb-2">
                  <div 
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.min(100, keystrokeDeltas.length)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{keystrokeDeltas.length} keystrokes</span>
                  <span>
                    {keystrokeDeltas.length < 20 ? (
                      <>{20 - keystrokeDeltas.length} to initial check</>
                    ) : keystrokeDeltas.length < 100 ? (
                      <>{100 - keystrokeDeltas.length} to full verification</>
                    ) : (
                      <>Ready for verification</>
                    )}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-6 mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Human Score</span>
                <span className="text-xs font-medium">{humanScore}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full", 
                    humanScore > 70 ? "bg-green-500" :
                    humanScore > 40 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${humanScore}%` }}
                />
              </div>
            </div>
            
            <div className="mt-auto pt-4 text-xs text-muted-foreground">
              {keystrokeDeltas.length} keystrokes recorded
              {proofStatus === "verified" && (
                <div className="mt-2 text-green-500 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified as human typed
                </div>
              )}
              {proofStatus === "failed" && (
                <div className="mt-2 text-red-500">
                  Could not verify human typing pattern
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="border rounded-md p-4 min-h-[400px] overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </TabsContent>
      </Tabs>

      {/* ZK Proof Modal */}
      <ZKTypingProofModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        contentId={fileId || 'new-content'}
        content={content}
        keystrokeDeltas={keystrokeDeltas}
      />
    </div>
  );
}; 