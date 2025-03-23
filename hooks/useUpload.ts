'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import { getExplorerUrl } from '@/lib/0g/network';

// Define the structure for fees
interface UploadFees {
  storageFee: string;
  estimatedGas: string;
  totalFee: string;
}

// Define the structure for upload status
interface UploadStatus {
  isUploading: boolean;
  isSuccess: boolean;
  progress: number;
  rootHash?: string;
  txHash?: string;
  error?: string;
  fees?: UploadFees;
  statusMessage?: string;
}

// The hook's return type
interface UseUploadReturn {
  status: UploadStatus;
  uploadFile: (file: File) => Promise<void>;
  resetUpload: () => void;
  getTransactionExplorerUrl: (txHash: string) => string;
}

/**
 * Hook for handling file uploads to 0G decentralized storage
 * @param signer - Ethers.js signer for signing transactions
 * @returns Upload state and methods
 */
export function useUpload(signer: ethers.Signer | null): UseUploadReturn {
  const [status, setStatus] = useState<UploadStatus>({
    isUploading: false,
    isSuccess: false,
    progress: 0,
    rootHash: undefined,
    txHash: undefined,
    error: undefined,
    fees: undefined,
    statusMessage: undefined,
  });

  /**
   * Reset the upload state
   */
  const resetUpload = useCallback(() => {
    setStatus({
      isUploading: false,
      isSuccess: false,
      progress: 0,
      rootHash: undefined,
      txHash: undefined,
      error: undefined,
      fees: undefined,
      statusMessage: undefined,
    });
  }, []);

  /**
   * Upload a file to 0G storage
   * @param file - The file to upload
   */
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    if (!signer) {
      setStatus(prev => ({
        ...prev,
        error: 'No wallet connected. Please connect your wallet to upload files.'
      }));
      toast({
        title: 'Upload Error',
        description: 'No wallet connected. Please connect your wallet.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Reset state and start upload
      setStatus({
        isUploading: false,
        isSuccess: false,
        progress: 0,
        statusMessage: 'Preparing file for upload...',
      });

      // MOCK: Instead of using ZeroGClient, we'll simulate the upload process
      // In a real implementation, this would use the 0G SDK

      // Simulate fee calculation
      setStatus(prev => ({ 
        ...prev, 
        progress: 10,
        statusMessage: 'Calculating storage fees...',
        fees: {
          storageFee: (file.size / 1024 / 1024 * 0.01).toFixed(4),
          estimatedGas: '0.0025',
          totalFee: ((file.size / 1024 / 1024 * 0.01) + 0.0025).toFixed(4)
        }
      }));

      // Give user time to see the fees
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Start the upload process
      setStatus(prev => ({ 
        ...prev, 
        progress: 20,
        isUploading: true,
        statusMessage: 'Preparing file for upload...'
      }));

      // Read the file
      const fileBuffer = await file.arrayBuffer();
      
      // Create a blob object from the file
      setStatus(prev => ({ 
        ...prev, 
        progress: 40,
        statusMessage: 'Processing file data...'
      }));

      // In a real implementation, this would use the 0G SDK to create a blob
      // We'll simulate a root hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const rootHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setStatus(prev => ({ 
        ...prev, 
        progress: 60,
        statusMessage: 'Sending transaction...'
      }));

      // Simulate transaction process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a mock transaction hash
      const txHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');

      // Simulate successful upload
      setStatus(prev => ({ 
        ...prev, 
        progress: 100,
        isUploading: false,
        isSuccess: true,
        rootHash,
        txHash,
        statusMessage: 'Upload complete'
      }));

      toast({
        title: 'Upload Success',
        description: 'Your file has been uploaded to 0G Storage',
      });

      return;
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown upload error occurred'
      }));

      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file to 0G Storage',
        variant: 'destructive',
      });
    }
  }, [signer]);

  /**
   * Get the transaction explorer URL
   * @param txHash - The transaction hash
   * @returns The explorer URL for the transaction
   */
  const getTransactionExplorerUrl = useCallback((txHash: string): string => {
    return getExplorerUrl(txHash);
  }, []);

  return {
    status,
    uploadFile,
    resetUpload,
    getTransactionExplorerUrl,
  };
} 