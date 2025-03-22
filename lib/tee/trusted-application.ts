/**
 * Trusted Application Framework for abroOs
 * 
 * This file defines the core interfaces and classes for managing 
 * Trusted Applications (TAs) within the simulated TEE.
 */

/**
 * Permission levels for Trusted Applications
 */
export enum TeePermission {
  READ_SECURE_STORAGE = 'read_secure_storage',
  WRITE_SECURE_STORAGE = 'write_secure_storage',
  CRYPTO_OPERATIONS = 'crypto_operations',
  BIOMETRIC_ACCESS = 'biometric_access',
  SECURE_COMMUNICATION = 'secure_communication',
  KEY_MANAGEMENT = 'key_management',
  ATTESTATION = 'attestation',
}

/**
 * Interface defining a Trusted Application
 */
export interface TrustedApplication {
  id: string;
  name: string;
  description: string;
  version: string;
  permissions: TeePermission[];
  signature: string; // For verification
  attestationRequired: boolean;
  icon?: string;
  author?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for Trusted Application installation options
 */
export interface TaInstallOptions {
  overwriteExisting?: boolean;
  verifySignature?: boolean;
  autoStart?: boolean;
}

/**
 * Enumerates the possible states of a Trusted Application
 */
export enum TaState {
  INSTALLED = 'installed',
  RUNNING = 'running',
  PAUSED = 'paused',
  TERMINATED = 'terminated',
  ERROR = 'error',
}

/**
 * Interface for Trusted Application runtime state
 */
export interface TaRuntime {
  state: TaState;
  startTime?: number;
  memoryUsage?: number;
  secureObjectCount?: number;
  lastError?: string;
}

/**
 * Registry of trusted applications
 * Responsible for managing the lifecycle of TAs
 */
export class TrustedApplicationRegistry {
  private static instance: TrustedApplicationRegistry;
  private trustedApps: Map<string, TrustedApplication> = new Map();
  private taRuntimes: Map<string, TaRuntime> = new Map();
  private listeners: Map<string, Function[]> = new Map();
  
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TrustedApplicationRegistry {
    if (!TrustedApplicationRegistry.instance) {
      TrustedApplicationRegistry.instance = new TrustedApplicationRegistry();
    }
    return TrustedApplicationRegistry.instance;
  }
  
  /**
   * Register a Trusted Application
   * @param app The Trusted Application to register
   * @param options Installation options
   * @returns boolean indicating success
   */
  public register(
    app: TrustedApplication, 
    options: TaInstallOptions = { verifySignature: true }
  ): boolean {
    // Check if app already exists
    if (this.trustedApps.has(app.id) && !options.overwriteExisting) {
      console.warn(`Trusted Application ${app.id} already registered`);
      return false;
    }
    
    // Verify signature if required
    if (options.verifySignature && !this.verifySignature(app)) {
      console.error(`Invalid signature for Trusted Application ${app.id}`);
      return false;
    }
    
    // Register the application
    this.trustedApps.set(app.id, app);
    
    // Initialize runtime state
    this.taRuntimes.set(app.id, {
      state: TaState.INSTALLED,
    });
    
    // Auto-start if specified
    if (options.autoStart) {
      this.startTrustedApp(app.id);
    }
    
    // Notify listeners
    this.notifyListeners('app-installed', { app });
    
    return true;
  }
  
  /**
   * Start a Trusted Application
   * @param appId The ID of the app to start
   * @returns boolean indicating success
   */
  public startTrustedApp(appId: string): boolean {
    const app = this.trustedApps.get(appId);
    const runtime = this.taRuntimes.get(appId);
    
    if (!app || !runtime) {
      console.error(`Trusted Application ${appId} not found`);
      return false;
    }
    
    if (runtime.state === TaState.RUNNING) {
      console.warn(`Trusted Application ${appId} is already running`);
      return true;
    }
    
    // Update runtime state
    this.taRuntimes.set(appId, {
      ...runtime,
      state: TaState.RUNNING,
      startTime: Date.now(),
      lastError: undefined,
    });
    
    // Notify listeners
    this.notifyListeners('app-started', { appId });
    
    return true;
  }
  
  /**
   * Stop a Trusted Application
   * @param appId The ID of the app to stop
   * @returns boolean indicating success
   */
  public stopTrustedApp(appId: string): boolean {
    const runtime = this.taRuntimes.get(appId);
    
    if (!runtime) {
      console.error(`Trusted Application ${appId} not found`);
      return false;
    }
    
    if (runtime.state !== TaState.RUNNING && runtime.state !== TaState.PAUSED) {
      console.warn(`Trusted Application ${appId} is not running`);
      return true;
    }
    
    // Update runtime state
    this.taRuntimes.set(appId, {
      ...runtime,
      state: TaState.TERMINATED,
    });
    
    // Notify listeners
    this.notifyListeners('app-stopped', { appId });
    
    return true;
  }
  
  /**
   * Unregister a Trusted Application
   * @param appId The ID of the app to unregister
   * @returns boolean indicating success
   */
  public unregister(appId: string): boolean {
    const app = this.trustedApps.get(appId);
    
    if (!app) {
      console.error(`Trusted Application ${appId} not found`);
      return false;
    }
    
    // Stop the app if it's running
    if (this.getAppState(appId) === TaState.RUNNING) {
      this.stopTrustedApp(appId);
    }
    
    // Remove the app
    this.trustedApps.delete(appId);
    this.taRuntimes.delete(appId);
    
    // Notify listeners
    this.notifyListeners('app-uninstalled', { appId });
    
    return true;
  }
  
  /**
   * Get the current state of a Trusted Application
   * @param appId The ID of the app
   * @returns The current state or undefined if the app doesn't exist
   */
  public getAppState(appId: string): TaState | undefined {
    return this.taRuntimes.get(appId)?.state;
  }
  
  /**
   * Get a Trusted Application by ID
   * @param appId The ID of the app
   * @returns The Trusted Application or undefined if not found
   */
  public getTrustedApp(appId: string): TrustedApplication | undefined {
    return this.trustedApps.get(appId);
  }
  
  /**
   * Get all registered Trusted Applications
   * @returns Array of all registered Trusted Applications
   */
  public getAllTrustedApps(): TrustedApplication[] {
    return Array.from(this.trustedApps.values());
  }
  
  /**
   * Verify the signature of a Trusted Application
   * In a real TEE, this would verify a cryptographic signature
   * For our demo, we'll use a simple validation
   * @param app The Trusted Application to verify
   * @returns boolean indicating if the signature is valid
   */
  private verifySignature(app: TrustedApplication): boolean {
    // For demo purposes, we just check if the signature starts with 'valid_'
    // In a real TEE implementation, this would verify using cryptographic means
    return app.signature.startsWith('valid_');
  }
  
  /**
   * Add a listener for specific events
   * @param event The event to listen for
   * @param callback The callback function
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)?.push(callback);
  }
  
  /**
   * Remove a listener for specific events
   * @param event The event to remove the listener from
   * @param callback The callback function to remove
   */
  public removeEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    const index = eventListeners.indexOf(callback);
    if (index !== -1) {
      eventListeners.splice(index, 1);
    }
  }
  
  /**
   * Notify all listeners of an event
   * @param event The event that occurred
   * @param data The data associated with the event
   */
  private notifyListeners(event: string, data: any): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    
    for (const listener of eventListeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    }
  }
} 