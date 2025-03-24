/**
 * TEE Manager for abroOs
 * 
 * This file provides the core management functionality for the 
 * Trusted Execution Environment simulation.
 */

import { TrustedApplicationRegistry, TaState } from './trusted-application';
import { SecureStorage } from './secure-storage';

/**
 * Attestation status enum
 */
export enum AttestationStatus {
  NONE = 'none',
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed'
}

/**
 * Interface for TEE event
 */
export interface TeeEvent {
  type: string;
  data: any;
  timestamp: number;
}

/**
 * Interface for TEE event listener
 */
export interface TeeEventListener {
  (event: TeeEvent): void;
}

/**
 * Singleton manager for the Trusted Execution Environment
 */
export class TeeManager {
  private static instance: TeeManager;
  private isActive: boolean = false;
  private attestationStatus: AttestationStatus = AttestationStatus.NONE;
  private eventListeners: Map<string, TeeEventListener[]> = new Map();
  private trustedApplicationRegistry: TrustedApplicationRegistry;
  private secureStorage: SecureStorage;
  private events: TeeEvent[] = [];
  private maxEventHistory: number = 100;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.trustedApplicationRegistry = TrustedApplicationRegistry.getInstance();
    this.secureStorage = SecureStorage.getInstance();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TeeManager {
    if (!TeeManager.instance) {
      TeeManager.instance = new TeeManager();
    }
    return TeeManager.instance;
  }
  
  /**
   * Activate the TEE
   * In a real implementation, this would initialize hardware TEE
   * @returns Promise resolving to success status
   */
  public async activateTee(): Promise<boolean> {
    if (this.isActive) return true;
    
    try {
      this.isActive = true;
      this.attestationStatus = AttestationStatus.PENDING;
      
      // Record the activation event
      this.recordEvent('tee-activated', { active: true });
      
      // Notify listeners about activation
      this.notifyListeners('activation', { active: true });
      
      // Simulate the attestation process
      this.performAttestation();
      
      // Initialize the secure storage
      const randomSeed = Math.random().toString(36).substring(2);
      await this.secureStorage.initialize(`tee-master-key-${randomSeed}`);
      
      return true;
    } catch (error) {
      console.error('Failed to activate TEE:', error);
      this.isActive = false;
      this.attestationStatus = AttestationStatus.FAILED;
      
      // Notify listeners about activation failure
      this.notifyListeners('activation-failed', { error });
      
      return false;
    }
  }
  
  /**
   * Perform the TEE attestation process
   * This is a simulated attestation for demo purposes
   */
  private performAttestation(): void {
    // Simulate attestation delay
    setTimeout(() => {
      // In a real TEE, attestation would verify the integrity of the environment
      this.attestationStatus = AttestationStatus.VERIFIED;
      
      // Record the attestation event
      this.recordEvent('attestation-completed', { status: this.attestationStatus });
      
      // Notify listeners
      this.notifyListeners('attestation', { status: this.attestationStatus });
    }, 1500);
  }
  
  /**
   * Deactivate the TEE
   */
  public deactivateTee(): void {
    if (!this.isActive) return;
    
    // Stop all running trusted applications
    const runningApps = this.trustedApplicationRegistry.getAllTrustedApps()
      .filter(app => this.trustedApplicationRegistry.getAppState(app.id) === TaState.RUNNING)
      .map(app => app.id);
    
    // Stop each running application
    runningApps.forEach(appId => {
      this.trustedApplicationRegistry.stopTrustedApp(appId);
    });
    
    // Deactivate the TEE
    this.isActive = false;
    this.attestationStatus = AttestationStatus.NONE;
    
    // Record the deactivation event
    this.recordEvent('tee-deactivated', { active: false });
    
    // Notify listeners
    this.notifyListeners('deactivation', { active: false });
  }
  
  /**
   * Check if the TEE is active
   * @returns Boolean indicating if the TEE is active
   */
  public isTeeActive(): boolean {
    return this.isActive;
  }
  
  /**
   * Get the current attestation status
   * @returns The current attestation status
   */
  public getAttestationStatus(): AttestationStatus {
    return this.attestationStatus;
  }
  
  /**
   * Start a trusted application
   * @param appId The ID of the app to start
   * @returns Promise resolving to success status
   */
  public async startTrustedApp(appId: string): Promise<boolean> {
    if (!this.isActive) {
      console.error('Cannot start trusted app: TEE is not active');
      return false;
    }
    
    if (this.attestationStatus !== AttestationStatus.VERIFIED) {
      console.error('Cannot start trusted app: TEE attestation not verified');
      return false;
    }
    
    const success = this.trustedApplicationRegistry.startTrustedApp(appId);
    
    if (success) {
      // Record the app start event
      this.recordEvent('app-started', { appId });
    }
    
    return success;
  }
  
  /**
   * Stop a trusted application
   * @param appId The ID of the app to stop
   * @returns Boolean indicating success
   */
  public stopTrustedApp(appId: string): boolean {
    if (!this.isActive) {
      console.error('Cannot stop trusted app: TEE is not active');
      return false;
    }
    
    const success = this.trustedApplicationRegistry.stopTrustedApp(appId);
    
    if (success) {
      // Record the app stop event
      this.recordEvent('app-stopped', { appId });
    }
    
    return success;
  }
  
  /**
   * Get the trusted application registry
   * @returns The trusted application registry
   */
  public getTrustedApplicationRegistry(): TrustedApplicationRegistry {
    return this.trustedApplicationRegistry;
  }
  
  /**
   * Get the secure storage
   * @returns The secure storage
   */
  public getSecureStorage(): SecureStorage {
    return this.secureStorage;
  }
  
  /**
   * Add an event listener
   * @param event The event to listen for
   * @param listener The listener function
   */
  public addEventListener(event: string, listener: TeeEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)?.push(listener);
  }
  
  /**
   * Remove an event listener
   * @param event The event to remove the listener from
   * @param listener The listener function to remove
   */
  public removeEventListener(event: string, listener: TeeEventListener): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Record an event in the TEE event history
   * @param type The type of event
   * @param data The event data
   */
  private recordEvent(type: string, data: any): void {
    const event: TeeEvent = {
      type,
      data,
      timestamp: Date.now()
    };
    
    // Add to event history
    this.events.unshift(event);
    
    // Limit the event history size
    if (this.events.length > this.maxEventHistory) {
      this.events = this.events.slice(0, this.maxEventHistory);
    }
  }
  
  /**
   * Get the TEE event history
   * @param limit Optional limit on the number of events to return
   * @returns Array of TEE events
   */
  public getEventHistory(limit?: number): TeeEvent[] {
    if (limit) {
      return this.events.slice(0, limit);
    }
    return [...this.events];
  }
  
  /**
   * Notify listeners of an event
   * @param event The event type
   * @param data The event data
   */
  private notifyListeners(event: string, data: any): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    
    const teeEvent: TeeEvent = {
      type: event,
      data,
      timestamp: Date.now()
    };
    
    for (const listener of listeners) {
      try {
        listener(teeEvent);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    }
  }
} 