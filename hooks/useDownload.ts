'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

// Define download status interface
interface DownloadStatus {
  isDownloading: boolean;
  progress: number;
  rootHash?: string;
  fileName?: string;
  error?: string;
  statusMessage?: string;
}

// Define hook return interface
interface UseDownloadReturn {
  status: DownloadStatus;
  downloadFile: (rootHash: string, fileName: string) => Promise<void>;
  resetDownload: () => void;
}

/**
 * Hook for downloading files from 0G storage
 * @returns Download status and methods
 */
export function useDownload(): UseDownloadReturn {
  const [status, setStatus] = useState<DownloadStatus>({
    isDownloading: false,
    progress: 0,
    rootHash: undefined,
    fileName: undefined,
    error: undefined,
    statusMessage: undefined,
  });

  /**
   * Reset the download state
   */
  const resetDownload = useCallback(() => {
    setStatus({
      isDownloading: false,
      progress: 0,
      rootHash: undefined,
      fileName: undefined,
      error: undefined,
      statusMessage: undefined,
    });
  }, []);

  /**
   * Download a file from 0G storage
   * @param rootHash - The root hash of the file to download
   * @param fileName - The name to save the file as
   */
  const downloadFile = useCallback(async (rootHash: string, fileName: string): Promise<void> => {
    try {
      // Reset state and start download
      setStatus({
        isDownloading: true,
        progress: 0,
        rootHash,
        fileName,
        statusMessage: "Initializing download...",
      });

      // Validate inputs
      if (!rootHash || rootHash.length < 10) {
        throw new Error("Invalid root hash provided");
      }
      
      if (!fileName) {
        throw new Error("Filename is required");
      }

      // Simulate progress updates
      const interval = setInterval(() => {
        setStatus(prev => {
          // Only update if we're still downloading and below 90%
          if (prev.isDownloading && prev.progress < 90) {
            const newProgress = Math.min(prev.progress + 10, 90);
            
            // Update status message based on progress
            let statusMessage = prev.statusMessage;
            if (newProgress < 30) {
              statusMessage = "Requesting file from 0G network...";
            } else if (newProgress < 60) {
              statusMessage = "Retrieving data chunks...";
            } else if (newProgress < 90) {
              statusMessage = "Verifying file integrity...";
            }
            
            return {
              ...prev,
              progress: newProgress,
              statusMessage
            };
          }
          return prev;
        });
      }, 300);

      try {
        // In a real implementation, this would call the 0G SDK to download the file
        // For demo purposes, we're creating a mock file download
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a sample blob as if we received it from 0G
        const text = `This is a sample file downloaded from 0G Storage with root hash: ${rootHash}
        
=== 0G Storage File Information ===
Root Hash: ${rootHash}
Filename: ${fileName}
Download Time: ${new Date().toLocaleString()}

This is a simulated download for demonstration purposes.
In a real implementation, this would contain the actual file data retrieved from the 0G decentralized storage network.
`;
        const blob = new Blob([text], { type: 'text/plain' });
        
        // Update status message
        setStatus(prev => ({
          ...prev,
          statusMessage: "Preparing file for download...",
        }));
        
        // Create a download link and trigger it
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        // Update status before completion to give user feedback
        setStatus(prev => ({
          ...prev,
          progress: 95,
          statusMessage: "Download complete, saving file...",
        }));
        
        // Wait a bit to show the final status
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Download complete
        clearInterval(interval);
        setStatus({
          isDownloading: false,
          progress: 100,
          rootHash,
          fileName,
          statusMessage: "Download complete!",
        });

        toast({
          title: 'Download Complete',
          description: `${fileName} has been downloaded successfully`,
        });
      } catch (error) {
        clearInterval(interval);
        throw error;
      }
    } catch (error) {
      console.error('Error downloading file from 0G:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during download';
      
      setStatus(prev => ({
        ...prev,
        isDownloading: false,
        error: errorMessage,
        statusMessage: "Download failed",
      }));

      toast({
        title: 'Download Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, []);

  return {
    status,
    downloadFile,
    resetDownload,
  };
} 