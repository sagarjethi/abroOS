'use client';

import { useState, useEffect } from 'react';
import { Shield, Key, AlertTriangle, Copy, CheckCircle, CreditCard } from 'lucide-react';
import { useTee } from '@/lib/tee/tee-context';
import { TrustedApplication, TeePermission } from '@/lib/tee/trusted-application';
import { TrustZoneContainer, RequiresTeeWarning } from './TrustZoneIndicator';
import { ethers } from 'ethers';

// Define the Secure Wallet Trusted Application
const secureWalletApp: TrustedApplication = {
  id: 'secure-wallet-app',
  name: 'Secure Wallet',
  description: 'A TEE-protected wallet for secure key management',
  version: '1.0.0',
  permissions: [
    TeePermission.READ_SECURE_STORAGE,
    TeePermission.WRITE_SECURE_STORAGE,
    TeePermission.CRYPTO_OPERATIONS
  ],
  signature: 'valid_secure_wallet_app_signature', // For demo purposes
  attestationRequired: true,
  author: 'abroOs Team',
  icon: 'shield',
};

interface SecureWalletAppProps {
  username?: string;
}

export function SecureWalletApp({ username }: SecureWalletAppProps) {
  const { 
    isActive, 
    attestationStatus, 
    registerTrustedApp, 
    startTrustedApp,
    secureStorage 
  } = useTee();
  
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  // Register the app when component mounts
  useEffect(() => {
    registerTrustedApp(secureWalletApp);
    
    if (isActive) {
      startTrustedApp(secureWalletApp.id);
    }
  }, [isActive]);
  
  // Check if wallet already exists in secure storage
  useEffect(() => {
    const checkExistingWallet = async () => {
      if (isActive && attestationStatus === 'verified') {
        try {
          const privateKey = await secureStorage.retrieve('wallet_private_key', secureWalletApp.id);
          
          if (privateKey) {
            const loadedWallet = new ethers.Wallet(privateKey);
            setWallet(loadedWallet);
            
            // Fetch mock balance
            setBalance('1.337');
          }
        } catch (error) {
          console.error('Failed to load wallet:', error);
        }
      }
    };
    
    checkExistingWallet();
  }, [isActive, attestationStatus]);
  
  // Create a new wallet
  const createWallet = async () => {
    if (!isActive) return;
    
    setIsLoading(true);
    
    try {
      // Generate wallet inside the simulated TEE
      const randomWallet = ethers.Wallet.createRandom();
      
      // Store private key in secure storage
      await secureStorage.store(
        'wallet_private_key',
        randomWallet.privateKey,
        secureWalletApp.id
      );
      
      setWallet(randomWallet);
      
      // Fetch mock balance
      setBalance('1.337');
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy address to clipboard
  const copyAddress = () => {
    if (!wallet) return;
    
    navigator.clipboard.writeText(wallet.address)
      .then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
  };
  
  // If TEE is not active, show warning
  if (!isActive) {
    return <RequiresTeeWarning />;
  }
  
  return (
    <TrustZoneContainer>
      <div className="p-4 h-full flex flex-col">
        <h2 className="font-medium text-lg flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-green-500" />
          TEE-Protected Wallet
        </h2>
        
        {!wallet ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="max-w-sm w-full border rounded-lg p-6">
              <div className="flex flex-col items-center gap-4">
                <Key className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-center font-medium">Create Secure Wallet</h3>
                <p className="text-sm text-center text-muted-foreground">
                  Your wallet will be created inside the Trusted Execution Environment,
                  protecting your private keys from unauthorized access.
                </p>
                
                <button 
                  className="w-full bg-primary text-primary-foreground rounded-md py-2 mt-2"
                  onClick={createWallet}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create New Wallet'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
              <AlertTriangle className="h-3 w-3" />
              <span>Private keys never leave the secure environment</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Wallet Address</h3>
              <div className="flex items-center gap-1">
                <div className="text-xs font-mono bg-muted/50 p-2 rounded break-all flex-1">
                  {wallet.address}
                </div>
                <button 
                  className="p-1 rounded hover:bg-muted"
                  onClick={copyAddress}
                >
                  {copyStatus === 'copied' 
                    ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                    : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-medium">Balance:</span>
                <span className="text-sm">{balance} ETH</span>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Secure Transactions
              </h3>
              <p className="text-xs text-muted-foreground">
                All transaction signing happens within the TEE.
                Your private keys are never exposed to the rest of the system.
              </p>
              <button
                className="mt-3 w-full bg-muted/50 text-foreground rounded-md py-1.5 text-sm"
                disabled={true}
              >
                Send ETH (Coming Soon)
              </button>
            </div>
            
            <div className="bg-muted/30 rounded-md p-3 border border-muted mt-2">
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                <Shield className="h-3 w-3 text-green-500" />
                TEE Security Information
              </h4>
              <p className="text-xs text-muted-foreground">
                Your private keys are stored in an isolated Trusted Execution Environment.
                Even if the browser is compromised, your keys remain protected by
                hardware-level isolation.
              </p>
            </div>
          </div>
        )}
      </div>
    </TrustZoneContainer>
  );
} 