"use client";

import React, { useEffect, useState, useCallback } from "react";
import { File, Folder, FilePlus, Upload, Clock, Download, RefreshCw, ArrowLeft, X, HardDrive, LinkIcon, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { walletAccessor } from "@/lib/wallet/wallet-accessor";
import { useWalletAccessor } from "@/hooks/use-wallet-accessor";
import { walletService } from "@/lib/wallet/wallet-service";
import { ethers } from "ethers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUpload } from "@/hooks/useUpload";
import { useDownload } from "@/hooks/useDownload";
import { getExplorerUrl as get0GExplorerUrl, getNetworkConfig, getNetworkStatus, checkNetworkStatus, NetworkStatus } from "@/lib/0g/network";

interface ZeroGFile {
  rootHash: string;
  name: string;
  size: number;
  uploadDate: Date;
  transactionHash: string;
}

interface ZeroGFilesProps {
  title?: string;
}

// Mock API to simulate 0G functionality in the client - will be replaced with actual API calls in production
class ZeroGStorageClient {
  private files: Map<string, ZeroGFile> = new Map();
  private walletAddress: string | null = null;
  private provider: ethers.providers.JsonRpcProvider;
  
  constructor() {
    // Always use 0G Testnet for this client
    this.provider = new ethers.providers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
  }
  
  // Set the wallet address
  setWalletAddress(address: string | null) {
    this.walletAddress = address;
  }
  
  // Get provider for 0G Testnet
  getProvider() {
    return this.provider;
  }
  
  // Upload file - simulated function
  async uploadFile(file: File, signer: ethers.Wallet | null): Promise<ZeroGFile> {
    if (!this.walletAddress) throw new Error("Wallet not connected");
    if (!signer) throw new Error("Signer not available");
    
    // Connect the signer to the 0G Testnet provider
    const connectedSigner = signer.connect(this.provider);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock hash based on file content
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const rootHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create transaction hash - in a real implementation, this would be the result of a blockchain transaction
    const txHash = '0x' + Array(64).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Create file record
    const newFile: ZeroGFile = {
      rootHash,
      name: file.name,
      size: file.size,
      uploadDate: new Date(),
      transactionHash: txHash
    };
    
    // Store in map
    this.files.set(rootHash, newFile);
    
    return newFile;
  }
  
  // Get all files for the current wallet
  async getFiles(): Promise<ZeroGFile[]> {
    if (!this.walletAddress) return [];
    
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return Array.from(this.files.values());
  }
  
  // Download file - simulated function
  async downloadFile(rootHash: string): Promise<Blob | null> {
    if (!this.walletAddress) return null;
    
    const file = this.files.get(rootHash);
    if (!file) return null;
    
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create mock content
    const content = `This is a simulated download of file ${file.name} with root hash ${rootHash}`;
    return new Blob([content], { type: 'text/plain' });
  }
  
  // Get explorer URL for 0G Testnet
  getExplorerUrl(hash: string, type: 'tx' | 'address'): string {
    return `https://blockexplorer-testnet.0g.ai/${type}/${hash}`;
  }
}

// Use this as a mock client
const zeroGClient = new ZeroGStorageClient();

export const ZeroGFiles: React.FC<ZeroGFilesProps> = ({ 
  title = '0G Storage Files'
}) => {
  const { walletAddress, isAccessorAvailable, accessor } = useWalletAccessor();
  const [files, setFiles] = useState<ZeroGFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ZeroGFile | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("files");
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  // Get wallet signer for 0G operations
  const signer = accessor?.getWallet() || null;
  
  // Use our new upload and download hooks
  const { 
    status: uploadStatus, 
    uploadFile, 
    resetUpload,
    getTransactionExplorerUrl
  } = useUpload(signer);
  
  const { 
    status: downloadStatus, 
    downloadFile, 
    resetDownload 
  } = useDownload();
  
  // Add network status state
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
  
  // Force the wallet to use 0G Testnet when the component mounts
  useEffect(() => {
    try {
      // Change network to 0G Testnet
      walletService.setNetwork('zerogtestnet');
      
      // Show a toast to inform the user
      toast({
        title: "Connected to 0G Testnet",
        description: "Using 0G Testnet network for storage operations"
      });
      
      // Check network status
      checkNetworkConnectivity();
    } catch (error) {
      console.error("Error switching to 0G Testnet:", error);
      toast({
        title: "Network Error",
        description: "Failed to connect to 0G Testnet",
        variant: "destructive"
      });
    }
  }, []);
  
  // Check network connectivity
  const checkNetworkConnectivity = useCallback(async () => {
    try {
      const status = await checkNetworkStatus();
      setNetworkStatus(status.status);
      
      if (status.status === 'offline') {
        toast({
          title: "Network Unavailable",
          description: status.message || "0G Storage network is currently unavailable",
          variant: "destructive"
        });
      } else if (status.status === 'degraded') {
        toast({
          title: "Network Issues",
          description: status.message || "0G Storage network is experiencing issues",
          variant: "warning"
        });
      }
    } catch (error) {
      console.error("Error checking network status:", error);
      setNetworkStatus('unknown');
    }
  }, []);
  
  // Periodically check network status
  useEffect(() => {
    checkNetworkConnectivity();
    
    const interval = setInterval(() => {
      checkNetworkConnectivity();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [checkNetworkConnectivity]);
  
  // Load files from local storage initially, will be replaced with actual 0G Storage API calls
  const loadFiles = useCallback(async () => {
    if (!walletAddress) {
      setFiles([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would fetch files from 0G storage
      // For now, we're loading from localStorage to simulate persistence
      const savedFiles = localStorage.getItem(`0g-files-${walletAddress}`);
      const parsedFiles = savedFiles ? JSON.parse(savedFiles) : [];
      
      // Convert date strings back to Date objects
      const files = parsedFiles.map((file: any) => ({
        ...file,
        uploadDate: new Date(file.uploadDate)
      }));
      
      setFiles(files);
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Failed to Load Files",
        description: "Could not retrieve your 0G Storage files",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);
  
  // Save files to local storage when they change
  useEffect(() => {
    if (walletAddress && files.length > 0) {
      localStorage.setItem(`0g-files-${walletAddress}`, JSON.stringify(files));
    }
  }, [files, walletAddress]);
  
  // Load initial files
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  
  // Handle file upload process
  const handleFileUpload = async () => {
    if (!walletAddress || !isAccessorAvailable || filesToUpload.length === 0) {
      toast({
        title: "Upload Failed",
        description: "Please connect your wallet and select files to upload",
        variant: "destructive"
      });
      return;
    }
    
    // Only handle one file at a time for now
    const file = filesToUpload[0];
    
    try {
      // Use our upload hook
      await uploadFile(file);
      
      // If upload was successful and we have a root hash and transaction hash
      if (uploadStatus.isSuccess && uploadStatus.rootHash && uploadStatus.txHash) {
        // Add the new file to our list
        const newFile: ZeroGFile = {
          rootHash: uploadStatus.rootHash,
          name: file.name,
          size: file.size,
          uploadDate: new Date(),
          transactionHash: uploadStatus.txHash
        };
        
        setFiles(prev => [...prev, newFile]);
        
        // Close dialog and reset state
        setIsUploadDialogOpen(false);
        setFilesToUpload([]);
        resetUpload();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };
  
  // Handle file download process
  const handleDownloadFile = async (file: ZeroGFile) => {
    if (!walletAddress) {
      toast({
        title: "Download Failed",
        description: "Please connect your wallet to download files",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Use our download hook
      await downloadFile(file.rootHash, file.name);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };
  
  // Update the explorer URL function to use 0G explorer
  const getExplorerUrl = (hash: string, type: 'tx' | 'address'): string => {
    return get0GExplorerUrl(hash);
  };
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              loadFiles();
              checkNetworkConnectivity();
            }}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          
          <h2 className="text-lg font-medium">{title}</h2>
          
          {/* Network badge with status indicator */}
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={cn(
                "ml-2",
                networkStatus === 'online' && "bg-blue-100 text-blue-800",
                networkStatus === 'degraded' && "bg-yellow-100 text-yellow-800",
                networkStatus === 'offline' && "bg-red-100 text-red-800",
                networkStatus === 'unknown' && "bg-gray-100 text-gray-800"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mr-1.5",
                networkStatus === 'online' && "bg-green-500",
                networkStatus === 'degraded' && "bg-yellow-500",
                networkStatus === 'offline' && "bg-red-500",
                networkStatus === 'unknown' && "bg-gray-500"
              )}/>
              0G Testnet
            </Badge>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={checkNetworkConnectivity}
              title="Check network status"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => setIsUploadDialogOpen(true)}
            disabled={!walletAddress || !isAccessorAvailable || networkStatus === 'offline'}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>
      
      {/* Display warning when network is not online */}
      {networkStatus !== 'online' && networkStatus !== 'unknown' && (
        <div className={cn(
          "mb-4 p-3 rounded-md text-sm",
          networkStatus === 'degraded' && "bg-yellow-50 text-yellow-800 border border-yellow-200",
          networkStatus === 'offline' && "bg-red-50 text-red-800 border border-red-200"
        )}>
          <div className="flex items-center">
            {networkStatus === 'degraded' ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                <span>
                  0G network is experiencing issues. Storage operations may be delayed or unreliable.
                </span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                <span>
                  0G network is currently offline. Storage operations will not work until connectivity is restored.
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="files" className="flex-1 pt-4 flex flex-col">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading files from 0G Storage...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Folder className="h-16 w-16 mb-2" />
                  <p>No files stored on 0G Storage</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
                    0G Storage offers decentralized, permanent storage on the blockchain.
                    Files uploaded here are stored across the network, ensuring availability and censorship resistance.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsUploadDialogOpen(true)} 
                    className="mt-4"
                    disabled={!walletAddress}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First File
                  </Button>
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Root Hash</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow 
                        key={file.rootHash}
                        className={cn(
                          selectedFile?.rootHash === file.rootHash && "bg-accent",
                          "cursor-pointer hover:bg-accent/50"
                        )}
                        onClick={() => setSelectedFile(file)}
                      >
                        <TableCell className="font-medium flex items-center">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          {file.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center">
                            {walletAccessor.formatAddress(file.rootHash)}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(file.rootHash);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>{formatDate(file.uploadDate)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={downloadStatus.isDownloading && downloadStatus.rootHash === file.rootHash}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file);
                            }}
                          >
                            {downloadStatus.isDownloading && downloadStatus.rootHash === file.rootHash ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="flex-1 pt-4 flex flex-col">
          <Card className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading transaction history...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <Clock className="h-16 w-16 mb-2" />
                  <p>No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
                    Each file uploaded to 0G Storage creates a blockchain transaction.
                    View transaction details, status, and link to block explorer here.
                  </p>
                </div>
              ) : (
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Transaction Hash</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.rootHash + "-tx"} className="hover:bg-accent/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <File className="h-4 w-4 mr-2 text-blue-500" />
                            {file.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <div className="flex items-center">
                            {walletAccessor.formatAddress(file.transactionHash)}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-1"
                              onClick={() => copyToClipboard(file.transactionHash)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(file.uploadDate)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const explorerUrl = getExplorerUrl(file.transactionHash, 'tx');
                              window.open(explorerUrl, '_blank');
                            }}
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            View on Explorer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* File Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(open) => {
        setIsUploadDialogOpen(open);
        if (!open) {
          resetUpload();
          setFilesToUpload([]);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload to 0G Storage</DialogTitle>
            <DialogDescription>
              Files will be stored on the 0G decentralized storage network
            </DialogDescription>
          </DialogHeader>
          {networkStatus !== 'online' && networkStatus !== 'unknown' && (
            <div className={cn(
              "p-3 rounded-md text-sm mt-2",
              networkStatus === 'degraded' && "bg-yellow-50 text-yellow-800 border border-yellow-200",
              networkStatus === 'offline' && "bg-red-50 text-red-800 border border-red-200"
            )}>
              <div className="flex items-center">
                {networkStatus === 'degraded' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      Network is experiencing issues. Uploads may be slower than usual or fail.
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      Network is currently offline. You cannot upload files until connectivity is restored.
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          <div className="space-y-4 py-4">
            {!uploadStatus.isUploading ? (
              <>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="file-upload">Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        setFilesToUpload(Array.from(e.target.files));
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 100MB. Files are stored permanently on 0G network.
                  </p>
                </div>
                
                {filesToUpload.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium mb-2">Selected Files:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {filesToUpload.map((file, index) => (
                        <li key={index}>
                          {file.name} ({formatFileSize(file.size)})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {uploadStatus.fees && (
                  <div className="text-sm space-y-2 p-3 border rounded-md bg-muted/50">
                    <p className="font-medium">Storage Fees:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-muted-foreground">Storage Fee:</span>
                      <span>{uploadStatus.fees.storageFee} A0GI</span>
                      <span className="text-muted-foreground">Estimated Gas:</span>
                      <span>{uploadStatus.fees.estimatedGas} A0GI</span>
                      <span className="text-muted-foreground font-medium">Total:</span>
                      <span className="font-medium">{uploadStatus.fees.totalFee} A0GI</span>
                    </div>
                  </div>
                )}
                
                {uploadStatus.error && (
                  <div className="text-sm p-3 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
                    {uploadStatus.error}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-medium">Uploading Files...</p>
                  <p className="text-sm text-muted-foreground">
                    {uploadStatus.statusMessage || "Processing your upload..."}
                  </p>
                </div>
                <Progress value={uploadStatus.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Preparing</span>
                  <span>Processing</span>
                  <span>Completing</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDialogOpen(false);
                resetUpload();
              }}
              disabled={uploadStatus.isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload} 
              disabled={uploadStatus.isUploading || filesToUpload.length === 0}
            >
              {uploadStatus.isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Download Status Toast */}
      {downloadStatus.isDownloading && downloadStatus.statusMessage && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-md shadow-md p-4 w-72 z-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{downloadStatus.fileName}</h4>
              <p className="text-xs text-muted-foreground mt-1">{downloadStatus.statusMessage}</p>
              <Progress value={downloadStatus.progress} className="h-1.5 mt-2" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 