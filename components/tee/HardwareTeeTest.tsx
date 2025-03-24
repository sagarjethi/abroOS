'use client';

import { useState, useEffect } from 'react';
import { useTee } from '@/lib/tee/tee-context';
import { TrustZoneContainer } from './TrustZoneIndicator';
import { HardwareTeeManager, TeeHardwareInfo } from '@/lib/tee/hardware-integration';
import { Shield, Server, AlertTriangle, Cpu, Check, X } from 'lucide-react';

export function HardwareTeeTest() {
  const { isActive, attestationStatus } = useTee();
  const [hardwareTeeManager, setHardwareTeeManager] = useState<HardwareTeeManager | null>(null);
  const [teeInfo, setTeeInfo] = useState<TeeHardwareInfo | null>(null);
  const [isHardwareAvailable, setIsHardwareAvailable] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testRunning, setTestRunning] = useState<boolean>(false);
  
  // Initialize hardware TEE manager when component mounts
  useEffect(() => {
    const initializeHardwareTee = async () => {
      if (!isActive) return;
      
      setIsInitializing(true);
      
      try {
        // Get the hardware TEE manager instance
        const manager = HardwareTeeManager.getInstance();
        setHardwareTeeManager(manager);
        
        // Initialize with hardware
        const isInitialized = await manager.initializeWithHardware();
        setIsHardwareAvailable(isInitialized);
        
        if (isInitialized) {
          // Get hardware TEE info
          const info = await manager.getHardwareTeeInfo();
          setTeeInfo(info);
        }
      } catch (error) {
        console.error('Failed to initialize hardware TEE:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeHardwareTee();
  }, [isActive]);
  
  /**
   * Run a test function in the hardware TEE
   */
  const runTestInTee = async () => {
    if (!hardwareTeeManager || !isHardwareAvailable) {
      setTestResult('Hardware TEE not available');
      return;
    }
    
    setTestRunning(true);
    setTestResult(null);
    
    try {
      // Run a test function in the hardware TEE
      const result = await hardwareTeeManager.executeSecurely('hardware-test-app', async () => {
        // This code would execute within the TEE
        
        // Simulate some secure computation
        const secureValue = Math.random() * 1000;
        
        // In a real TEE, this would be protected from the outside world
        const encryptedResult = secureValue * 2;
        
        // Return the result
        return {
          status: 'success',
          secureValue,
          encryptedResult,
          executedIn: teeInfo?.type || 'unknown',
          timestamp: Date.now()
        };
      });
      
      // Display the result
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setTestRunning(false);
    }
  };
  
  return (
    <TrustZoneContainer>
      <div className="p-4 h-full">
        <h2 className="font-medium text-lg flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-green-500" />
          Hardware TEE Testing
        </h2>
        
        <div className="grid gap-4">
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Hardware TEE Status
            </h3>
            
            <div className="space-y-2">
              {isInitializing ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>Initializing hardware TEE...</span>
                </div>
              ) : isHardwareAvailable ? (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <Check className="h-4 w-4" />
                  <span>Hardware TEE available: {teeInfo?.type}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No hardware TEE detected, using simulation</span>
                </div>
              )}
              
              {teeInfo && (
                <div className="mt-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{teeInfo.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">{teeInfo.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Level:</span>
                    <span className="font-medium">{teeInfo.securityLevel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teeInfo.features.map(feature => (
                        <span key={feature} className="bg-muted px-1.5 py-0.5 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Run Test in Hardware TEE
            </h3>
            
            <p className="text-xs text-muted-foreground mb-3">
              This will execute a test function within the hardware TEE (if available) 
              or fall back to the simulated TEE.
            </p>
            
            <button 
              className="w-full bg-primary text-primary-foreground rounded-md py-2 flex items-center justify-center gap-2"
              onClick={runTestInTee}
              disabled={testRunning || !isActive}
            >
              {testRunning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Running test in TEE...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Run Test in TEE</span>
                </>
              )}
            </button>
            
            {testResult && (
              <div className="mt-4">
                <h4 className="text-xs font-medium mb-2">Test Result:</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
          
          <div className="border rounded-md p-3">
            <h4 className="text-xs font-medium mb-2">Integration Notes</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>On Intel CPUs with SGX, install SGX driver and SDK</li>
              <li>On ARM devices, ensure TrustZone is enabled</li>
              <li>For cloud deployment, use confidential computing VMs</li>
              <li>Intel SGX requires DCAP attestation for production</li>
              <li>ARM TrustZone requires proper key provisioning</li>
            </ul>
          </div>
        </div>
      </div>
    </TrustZoneContainer>
  );
} 