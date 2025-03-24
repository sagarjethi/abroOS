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
import { evmWalletService } from "@/lib/wallet/wallet-service";
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
import { uploadToStorage } from "@/lib/0g/uploader";
import { Blob as ZeroGBlob } from "@0glabs/0g-ts-sdk";

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
  
  // Add network status state - initialize to 'online' for testing
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('online');
  
  // Force the wallet to use 0G Testnet when the component mounts
  useEffect(() => {
    try {
      // Change network to 0G Testnet
      evmWalletService.setNetwork('zerogtestnet');
      
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
          description: "0G Testnet is currently unavailable. Please try again later.",
          variant: "destructive"
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
  
  // Effect to update client with wallet address
  useEffect(() => {
    if (walletAddress) {
      // When wallet address changes, fetch files
      fetchFiles();
    }
  }, [walletAddress]);
  
  // Function to fetch files from 0G Storage
  const fetchFiles = useCallback(async () => {
    if (!walletAddress || !signer) {
      setFiles([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would fetch files from the 0G indexer
      // For now, we'll use mock data since we're in development
      const mockFiles: ZeroGFile[] = [
        {
          rootHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
          name: "Example File 1.pdf",
          size: 1024 * 1024 * 2.5, // 2.5 MB
          uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          transactionHash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
        },
        {
          rootHash: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
          name: "Important Document.docx",
          size: 1024 * 512, // 512 KB
          uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          transactionHash: "0xbcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a"
        }
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error Fetching Files",
        description: "There was an error retrieving your files from 0G Storage.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, signer]);
  
  // Function to handle clicking on a file
  const handleFileClick = useCallback((file: ZeroGFile) => {
    setSelectedFile(file);
  }, []);
  
  // Function to handle file download
  const handleFileDownload = useCallback(async (file: ZeroGFile) => {
    if (!walletAddress || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to download files.",
        variant: "destructive"
      });
      return;
    }
    
    downloadFile(file.rootHash, file.name);
  }, [walletAddress, signer, downloadFile]);
  
  // Function to prepare for file upload
  const handlePrepareUpload = useCallback(() => {
    setFilesToUpload([]);
    resetUpload();
    setIsUploadDialogOpen(true);
  }, [resetUpload]);
  
  // Function to handle adding files to upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(Array.from(e.target.files));
    }
  }, []);
  
  // Function to handle file upload
  const handleFileUpload = useCallback(async () => {
    if (!walletAddress || !signer) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to upload files.",
        variant: "destructive"
      });
      return;
    }
    
    if (filesToUpload.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    // Upload each file using the useUpload hook
    for (const file of filesToUpload) {
      await uploadFile(file);
    }
    
    // If upload was successful, refresh the file list
    if (!uploadStatus.error && uploadStatus.isSuccess) {
      fetchFiles();
      setIsUploadDialogOpen(false);
    }
  }, [walletAddress, signer, filesToUpload, uploadFile, uploadStatus.error, uploadStatus.isSuccess, fetchFiles]);
  
  // Function to handle copying text to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The text has been copied to your clipboard.",
      duration: 2000
    });
  }, []);
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };
  
  // Update the explorer URL function to use 0G explorer
  const getExplorerUrl = (hash: string): string => {
    return get0GExplorerUrl(hash);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              networkStatus === 'online' ? "text-green-500" : 
              networkStatus === 'degraded' ? "text-yellow-500" : 
              networkStatus === 'offline' ? "text-red-500" : 
              "text-muted-foreground"
            )}
            title={`Network Status: ${networkStatus}`}
            onClick={() => {
              fetchFiles();
              checkNetworkConnectivity();
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handlePrepareUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="files" className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="files" onClick={() => setActiveTab("files")}>Files</TabsTrigger>
            <TabsTrigger value="activity" onClick={() => setActiveTab("activity")}>Activity</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto px-1">
          <TabsContent value="files" className="h-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8">
                <HardDrive className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-1">No Files Found</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-xs">
                  You don&apos;t have any files stored on 0G yet. Upload your first file to get started.
                </p>
                <Button onClick={handlePrepareUpload}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
            ) : (
              <Table>
                <TableCaption>Your files stored on 0G testnet</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow 
                      key={file.rootHash}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleFileClick(file)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="truncate max-w-[200px]">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.uploadDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDownload(file);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getExplorerUrl(file.transactionHash), '_blank');
                            }}
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="h-full px-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity on 0G Storage</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* File Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload to 0G Storage</DialogTitle>
            <DialogDescription>
              Upload a file to store it on the 0G decentralized storage network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!uploadStatus.isUploading ? (
              <>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="file-upload">File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Files will be stored on the 0G testnet. Storage fees apply.
                  </p>
                </div>
                
                {filesToUpload.length > 0 && (
                  <div className="text-sm space-y-2">
                    <p className="font-medium">Selected Files:</p>
                    <ul className="space-y-1">
                      {filesToUpload.map((file, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-500" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
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
              Upload
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