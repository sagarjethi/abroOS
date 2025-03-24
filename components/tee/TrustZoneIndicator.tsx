'use client';

import { Shield, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTee } from '@/lib/tee/tee-context';
import { AttestationStatus } from '@/lib/tee/tee-manager';

/**
 * Component that displays a visual indicator when the TEE is active
 * This appears at the top of the screen and provides a visual cue to users
 * that they are operating within a secure environment
 */
export function TrustZoneIndicator() {
  const { isActive, attestationStatus } = useTee();
  
  if (!isActive) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 border-t-4 border-green-500 bg-green-100/10 backdrop-blur-sm z-50 py-1 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-green-500">
        <Shield className="h-4 w-4" />
        <span className="text-xs font-medium">Trusted Execution Active</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className={`h-2 w-2 rounded-full ${
            attestationStatus === AttestationStatus.VERIFIED 
              ? 'bg-green-500' 
              : attestationStatus === AttestationStatus.PENDING 
                ? 'bg-amber-500 animate-pulse' 
                : 'bg-red-500'
          }`} />
          <span className="text-xs">
            {attestationStatus === AttestationStatus.VERIFIED 
              ? 'Attestation Verified' 
              : attestationStatus === AttestationStatus.PENDING 
                ? 'Verifying...' 
                : 'Attestation Failed'}
          </span>
        </div>
        <Lock className="h-3 w-3 text-green-500" />
      </div>
    </div>
  );
}

/**
 * Component that can be used inside Trusted Applications to indicate
 * that this particular window/section is running in the TEE
 */
export function TrustZoneLocalIndicator() {
  return (
    <div className="flex items-center gap-1 text-xs text-green-500 pr-2">
      <Shield className="h-3 w-3" />
      <span className="font-medium">TEE Protected</span>
    </div>
  );
}

/**
 * Component that adds a secure border to a Trusted Application
 * to visually indicate that it's running in the TEE
 */
export function TrustZoneContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-green-500/20 rounded-md shadow-[0_0_15px_rgba(34,197,94,0.15)] h-full">
      <div className="flex items-center justify-between bg-green-500/10 px-2 py-1">
        <TrustZoneLocalIndicator />
      </div>
      <div className="p-1 h-[calc(100%-28px)]">
        {children}
      </div>
    </div>
  );
}

/**
 * Component that displays a warning when the TEE is not active
 * This is useful for components that require TEE functionality
 */
export function RequiresTeeWarning() {
  const { isActive, activateTee } = useTee();
  
  if (isActive) return null;
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <Shield className="h-10 w-10 text-muted-foreground opacity-30" />
      <h3 className="text-sm font-medium">Trusted Execution Required</h3>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        This application requires the Trusted Execution Environment to protect your sensitive data.
      </p>
      <button 
        className="bg-primary text-primary-foreground px-3 py-1 text-sm rounded-md mt-2"
        onClick={() => activateTee()}
      >
        Activate TEE
      </button>
    </div>
  );
} 