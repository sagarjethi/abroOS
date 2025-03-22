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
        isUploading: true,
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
        statusMessage: 'Calculating storage fees...'
      }));
      
      const fileSize = file.size;
      
      // Check if file is too large
      const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed (100MB). Current file size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB`);
      }
      
      // Mock fee calculation
      const storageFee = (fileSize / (1024 * 1024) * 0.01).toFixed(6);
      const estimatedGas = '0.002';
      const totalFee = (parseFloat(storageFee) + parseFloat(estimatedGas)).toFixed(6);
      
      setStatus(prev => ({
        ...prev,
        progress: 20,
        fees: {
          storageFee,
          estimatedGas,
          totalFee,
        },
        statusMessage: 'Generating file Merkle tree...'
      }));

      // Simulate file preparation
      setStatus(prev => ({ 
        ...prev, 
        progress: 30,
        statusMessage: 'Reading file data...'
      }));
      
      // Read the file
      const fileBuffer = await file.arrayBuffer();
      
      // Simulate merkle tree generation and submission
      setStatus(prev => ({ 
        ...prev, 
        progress: 50,
        statusMessage: 'Uploading to 0G network...'
      }));

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus(prev => ({ 
        ...prev, 
        progress: 70,
        statusMessage: 'Processing transaction...'
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus(prev => ({ 
        ...prev, 
        progress: 80,
        statusMessage: 'Waiting for transaction confirmation...'
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful upload
      // Generate a mock root hash and transaction hash
      const rootHash = `0x${Array.from(new Array(64)).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const txHash = `0x${Array.from(new Array(64)).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Success!
      setStatus({
        isUploading: false,
        isSuccess: true,
        progress: 100,
        rootHash: rootHash,
        txHash: txHash,
        fees: {
          storageFee,
          estimatedGas,
          totalFee,
        },
        statusMessage: 'Upload complete!'
      });

      toast({
        title: 'Upload Successful',
        description: `File uploaded to 0G Storage successfully`,
      });

    } catch (error) {
      console.error('Error uploading file to 0G:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during upload';
      
      setStatus(prev => ({
        ...prev,
        isUploading: false,
        isSuccess: false,
        error: errorMessage,
        statusMessage: 'Upload failed'
      }));

      toast({
        title: 'Upload Failed',
        description: errorMessage,
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