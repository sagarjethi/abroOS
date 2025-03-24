'use client';

/**
 * TEE Context Provider for React applications
 * 
 * This file provides a React context that gives components 
 * access to the Trusted Execution Environment functionality.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TeeManager, AttestationStatus, TeeEvent } from './tee-manager';
import { TrustedApplicationRegistry, TrustedApplication, TaState } from './trusted-application';
import { SecureStorage } from './secure-storage';

/**
 * Interface for the TEE context
 */
interface TeeContextType {
  isActive: boolean;
  attestationStatus: AttestationStatus;
  activateTee: () => Promise<boolean>;
  deactivateTee: () => void;
  startTrustedApp: (appId: string) => Promise<boolean>;
  stopTrustedApp: (appId: string) => boolean;
  getTrustedApp: (appId: string) => TrustedApplication | undefined;
  getAllTrustedApps: () => TrustedApplication[];
  getAppState: (appId: string) => TaState | undefined;
  registerTrustedApp: (app: TrustedApplication) => boolean;
  eventHistory: TeeEvent[];
  secureStorage: SecureStorage;
}

// Create the context with default values
const TeeContext = createContext<TeeContextType>({
  isActive: false,
  attestationStatus: AttestationStatus.NONE,
  activateTee: async () => false,
  deactivateTee: () => {},
  startTrustedApp: async () => false,
  stopTrustedApp: () => false,
  getTrustedApp: () => undefined,
  getAllTrustedApps: () => [],
  getAppState: () => undefined,
  registerTrustedApp: () => false,
  eventHistory: [],
  secureStorage: {} as SecureStorage,
});

/**
 * Props for the TEE Provider component
 */
interface TeeProviderProps {
  children: ReactNode;
}

/**
 * TEE Provider component that provides TEE functionality to child components
 */
export function TeeProvider({ children }: TeeProviderProps) {
  // Get instances of the TEE components
  const teeManager = TeeManager.getInstance();
  const trustedAppRegistry = teeManager.getTrustedApplicationRegistry();
  const secureStorage = teeManager.getSecureStorage();
  
  // State for TEE status
  const [isActive, setIsActive] = useState(teeManager.isTeeActive());
  const [attestationStatus, setAttestationStatus] = useState(teeManager.getAttestationStatus());
  const [eventHistory, setEventHistory] = useState<TeeEvent[]>(teeManager.getEventHistory());
  
  // Update state when TEE events occur
  useEffect(() => {
    // Handler for activation events
    const handleActivation = (event: TeeEvent) => {
      setIsActive(event.data.active);
    };
    
    // Handler for attestation events
    const handleAttestation = (event: TeeEvent) => {
      setAttestationStatus(event.data.status);
    };
    
    // Handler for any event to update history
    const handleEvent = (event: TeeEvent) => {
      setEventHistory(teeManager.getEventHistory());
    };
    
    // Add event listeners
    teeManager.addEventListener('activation', handleActivation);
    teeManager.addEventListener('deactivation', handleActivation);
    teeManager.addEventListener('attestation', handleAttestation);
    teeManager.addEventListener('app-started', handleEvent);
    teeManager.addEventListener('app-stopped', handleEvent);
    teeManager.addEventListener('app-installed', handleEvent);
    teeManager.addEventListener('app-uninstalled', handleEvent);
    
    // Cleanup on unmount
    return () => {
      teeManager.removeEventListener('activation', handleActivation);
      teeManager.removeEventListener('deactivation', handleActivation);
      teeManager.removeEventListener('attestation', handleAttestation);
      teeManager.removeEventListener('app-started', handleEvent);
      teeManager.removeEventListener('app-stopped', handleEvent);
      teeManager.removeEventListener('app-installed', handleEvent);
      teeManager.removeEventListener('app-uninstalled', handleEvent);
    };
  }, [teeManager]);
  
  /**
   * Activate the TEE
   */
  const activateTee = async (): Promise<boolean> => {
    return await teeManager.activateTee();
  };
  
  /**
   * Deactivate the TEE
   */
  const deactivateTee = (): void => {
    teeManager.deactivateTee();
  };
  
  /**
   * Start a trusted application
   * @param appId ID of the app to start
   */
  const startTrustedApp = async (appId: string): Promise<boolean> => {
    return await teeManager.startTrustedApp(appId);
  };
  
  /**
   * Stop a trusted application
   * @param appId ID of the app to stop
   */
  const stopTrustedApp = (appId: string): boolean => {
    return teeManager.stopTrustedApp(appId);
  };
  
  /**
   * Get a trusted application by ID
   * @param appId ID of the app
   */
  const getTrustedApp = (appId: string): TrustedApplication | undefined => {
    return trustedAppRegistry.getTrustedApp(appId);
  };
  
  /**
   * Get all trusted applications
   */
  const getAllTrustedApps = (): TrustedApplication[] => {
    return trustedAppRegistry.getAllTrustedApps();
  };
  
  /**
   * Get the state of a trusted application
   * @param appId ID of the app
   */
  const getAppState = (appId: string): TaState | undefined => {
    return trustedAppRegistry.getAppState(appId);
  };
  
  /**
   * Register a trusted application
   * @param app The application to register
   */
  const registerTrustedApp = (app: TrustedApplication): boolean => {
    return trustedAppRegistry.register(app);
  };
  
  // Create the context value
  const contextValue: TeeContextType = {
    isActive,
    attestationStatus,
    activateTee,
    deactivateTee,
    startTrustedApp,
    stopTrustedApp,
    getTrustedApp,
    getAllTrustedApps,
    getAppState,
    registerTrustedApp,
    eventHistory,
    secureStorage,
  };
  
  return (
    <TeeContext.Provider value={contextValue}>
      {children}
    </TeeContext.Provider>
  );
}

/**
 * Custom hook to use the TEE context
 */
export function useTee(): TeeContextType {
  const context = useContext(TeeContext);
  
  if (context === undefined) {
    throw new Error('useTee must be used within a TeeProvider');
  }
  
  return context;
}

/**
 * Higher-order component to wrap a trusted application
 * @param Component The component to wrap
 * @param appId The ID of the trusted application
 */
export function withTrustedApp<P extends object>(
  Component: React.ComponentType<P>,
  appId: string
): React.FC<P> {
  const WithTrustedApp = (props: P) => {
    const { isActive, attestationStatus, startTrustedApp, stopTrustedApp } = useTee();
    const [isAppRunning, setIsAppRunning] = useState(false);
    
    useEffect(() => {
      // If TEE is active and attestation is verified, start the app
      if (isActive && attestationStatus === AttestationStatus.VERIFIED && !isAppRunning) {
        startTrustedApp(appId).then(success => {
          setIsAppRunning(success);
        });
      }
      
      // Cleanup when component unmounts
      return () => {
        if (isAppRunning) {
          stopTrustedApp(appId);
          setIsAppRunning(false);
        }
      };
    }, [isActive, attestationStatus, appId]);
    
    if (!isActive || attestationStatus !== AttestationStatus.VERIFIED || !isAppRunning) {
      // Render loading or error state
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              {!isActive ? 'TEE not active' : 
               attestationStatus !== AttestationStatus.VERIFIED ? 'TEE not verified' : 
               'Starting trusted application...'}
            </p>
          </div>
        </div>
      );
    }
    
    // Render the component if everything is ready
    return <Component {...props} />;
  };
  
  // Add display name to fix linter error
  WithTrustedApp.displayName = `WithTrustedApp(${Component.displayName || Component.name || 'Component'})`;
  
  return WithTrustedApp;
}

export default TeeContext; 