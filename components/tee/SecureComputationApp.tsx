'use client';

import { useState, useEffect } from 'react';
import { Shield, Calculator, User, Users, Server, Eye, EyeOff } from 'lucide-react';
import { useTee } from '@/lib/tee/tee-context';
import { TrustedApplication, TeePermission } from '@/lib/tee/trusted-application';
import { TrustZoneContainer, RequiresTeeWarning } from './TrustZoneIndicator';

// Define the Secure Computation Trusted Application
const secureComputationApp: TrustedApplication = {
  id: 'secure-computation-app',
  name: 'Secure Computation',
  description: 'A privacy-preserving multi-party computation app',
  version: '1.0.0',
  permissions: [
    TeePermission.READ_SECURE_STORAGE,
    TeePermission.WRITE_SECURE_STORAGE,
    TeePermission.CRYPTO_OPERATIONS,
    TeePermission.SECURE_COMMUNICATION
  ],
  signature: 'valid_secure_computation_app_signature', // For demo purposes
  attestationRequired: true,
  author: 'abroOs Team',
  icon: 'calculator',
};

// In a real implementation, this would use actual homomorphic encryption
// For the demo, we'll simulate the concept
function encryptValue(value: number): string {
  // Simple encryption simulation - not secure, just for demonstration
  return btoa(value.toString());
}

function decryptValue(encrypted: string): number {
  // Simple decryption simulation
  return parseFloat(atob(encrypted));
}

interface SecureComputationAppProps {
  username?: string;
}

export function SecureComputationApp({ username }: SecureComputationAppProps) {
  const { 
    isActive, 
    attestationStatus, 
    registerTrustedApp, 
    startTrustedApp,
    secureStorage 
  } = useTee();
  
  const [localValue, setLocalValue] = useState<string>('');
  const [partnerValue, setPartnerValue] = useState<string>('');
  const [computationResult, setComputationResult] = useState<number | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [showInputs, setShowInputs] = useState(true);
  
  // Register the app when component renders
  useEffect(() => {
    registerTrustedApp(secureComputationApp);
    
    if (isActive) {
      startTrustedApp(secureComputationApp.id);
    }
  }, [isActive, registerTrustedApp, startTrustedApp]);
  
  /**
   * Perform a secure computation within the TEE
   */
  const performSecureComputation = async () => {
    if (!isActive || !localValue || !partnerValue) {
      return;
    }
    
    setIsComputing(true);
    
    try {
      // In a real implementation, this would happen within the TEE:
      
      // 1. Encrypt values (simulating homomorphic encryption)
      const encryptedLocal = encryptValue(parseFloat(localValue));
      const encryptedPartner = encryptValue(parseFloat(partnerValue));
      
      // Store encrypted values in secure storage
      await secureStorage.store(
        'local_value',
        encryptedLocal,
        secureComputationApp.id
      );
      
      await secureStorage.store(
        'partner_value',
        encryptedPartner,
        secureComputationApp.id
      );
      
      // 2. Simulate sending to a remote TEE server for computation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Simulate receiving encrypted result
      // In a real implementation, the server would perform operations on encrypted data
      const encryptedResult = encryptValue(
        parseFloat(localValue) + parseFloat(partnerValue)
      );
      
      // Store the encrypted result
      await secureStorage.store(
        'computation_result',
        encryptedResult,
        secureComputationApp.id
      );
      
      // 4. Decrypt result in the local TEE
      const result = decryptValue(encryptedResult);
      setComputationResult(result);
    } catch (error) {
      console.error('Computation failed:', error);
    } finally {
      setIsComputing(false);
    }
  };
  
  // Toggle visibility of inputs
  const toggleInputVisibility = () => {
    setShowInputs(!showInputs);
  };
  
  // If TEE is not active, show warning
  if (!isActive) {
    return <RequiresTeeWarning />;
  }
  
  return (
    <TrustZoneContainer>
      <div className="p-4 h-full">
        <h2 className="font-medium text-lg flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-green-500" />
          Secure Multi-Party Computation
        </h2>
        
        <div className="mb-6">
          <div className="text-sm mb-4">
            <p className="text-muted-foreground mb-2">
              This application demonstrates how sensitive data can be processed securely using 
              a Trusted Execution Environment without exposing the individual values.
            </p>
            <div className="flex justify-end">
              <button
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                onClick={toggleInputVisibility}
              >
                {showInputs ? (
                  <>
                    <EyeOff className="h-3 w-3" />
                    <span>Hide Values</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Show Values</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Private Value
              </h3>
              <div>
                <label className="text-xs text-muted-foreground">
                  Enter your sensitive financial data:
                </label>
                <input
                  type={showInputs ? "text" : "password"}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  placeholder="e.g., 45000"
                />
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Partner&apos;s Private Value
              </h3>
              <div>
                <label className="text-xs text-muted-foreground">
                  Enter their sensitive financial data:
                </label>
                <input
                  type={showInputs ? "text" : "password"}
                  className="w-full mt-1 p-2 border rounded-md text-sm"
                  value={partnerValue}
                  onChange={(e) => setPartnerValue(e.target.value)}
                  placeholder="e.g., 52000"
                />
              </div>
            </div>
          </div>
          
          <button 
            className="w-full bg-primary text-primary-foreground rounded-md py-2 flex items-center justify-center gap-2"
            onClick={performSecureComputation}
            disabled={isComputing || !localValue || !partnerValue}
          >
            {isComputing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Processing in TEE...</span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                <span>Compute Securely</span>
              </>
            )}
          </button>
        </div>
        
        {computationResult !== null && (
          <div className="border-2 border-green-500/20 rounded-md p-4 bg-green-500/5">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-500" />
              Secure Computation Result
            </h3>
            
            <div className="flex flex-col items-center py-4">
              <span className="text-2xl font-bold">{computationResult}</span>
              <p className="text-xs text-muted-foreground mt-2">
                Result computed without revealing individual values
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-5 bg-muted/30 rounded-md p-3 border">
          <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
            <Server className="h-3 w-3" />
            How It Works
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal ml-4">
            <li>Your data is encrypted inside the TEE</li>
            <li>Computations happen on encrypted values</li>
            <li>Only the final result is decrypted</li>
            <li>Individual values are never exposed outside the TEE</li>
          </ol>
        </div>
      </div>
    </TrustZoneContainer>
  );
} 