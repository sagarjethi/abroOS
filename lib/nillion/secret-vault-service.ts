"use client";

import { v4 as uuidv4 } from 'uuid';

/**
 * Nillion SecretVault types for integration with the secretvaults package
 */

// Organization credentials type
export interface NillionOrgCredentials {
  privateKey: string;
  did: string;
}

// Node configuration type
export interface NillionNode {
  url: string;
  did: string;
}

// Organization configuration with credentials and nodes
export interface NillionOrgConfig {
  orgCredentials: NillionOrgCredentials;
  nodes: NillionNode[];
}

// Config for Web3 Experience Survey demo
const DEMO_ORG_CONFIG: NillionOrgConfig = {
  orgCredentials: {
    privateKey: "demo-private-key",
    did: "demo-org-did"
  },
  nodes: [
    {
      url: "https://demo-node1.nillion.com",
      did: "demo-node1-did"
    },
    {
      url: "https://demo-node2.nillion.com",
      did: "demo-node2-did"
    },
    {
      url: "https://demo-node3.nillion.com",
      did: "demo-node3-did"
    }
  ]
};

// Mock schema for Web3 Experience Survey
const WEB3_SURVEY_SCHEMA = {
  type: "object",
  properties: {
    _id: {
      type: "string"
    },
    years_in_web3: {
      type: "integer"
    },
    responses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          rating: {
            type: "integer",
            minimum: 1,
            maximum: 5
          },
          question_number: {
            type: "integer"
          }
        }
      }
    }
  },
  required: ["_id", "years_in_web3", "responses"]
};

/**
 * SecretVaultService - A mock implementation of Nillion's SecretVault that mimics its functionality
 * In a real implementation, this would use the actual secretvaults package
 */
export class SecretVaultService {
  private static instance: SecretVaultService;
  private orgConfig: NillionOrgConfig;
  private schemaId: string | null = null;
  private initialized = false;
  
  // In-memory storage for development/demo purposes
  private collections: Record<string, any[]> = {};
  
  private constructor() {
    // Default to demo config
    this.orgConfig = DEMO_ORG_CONFIG;
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): SecretVaultService {
    if (!SecretVaultService.instance) {
      SecretVaultService.instance = new SecretVaultService();
    }
    return SecretVaultService.instance;
  }
  
  /**
   * Set organization config
   */
  public setOrgConfig(config: NillionOrgConfig): void {
    this.orgConfig = config;
  }
  
  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    console.log("Initializing SecretVault service with nodes:", this.orgConfig.nodes.length);
    
    // In a real implementation, this would connect to the Nillion network
    this.initialized = true;
    console.log("SecretVault service initialized");
    
    return Promise.resolve();
  }
  
  /**
   * Create a collection with schema
   */
  public async createCollection(schema: any): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Generate a schema ID
    const schemaId = `schema-${uuidv4()}`;
    this.schemaId = schemaId;
    
    // Initialize an empty collection
    this.collections[schemaId] = [];
    
    console.log(`Created collection with schema ID: ${schemaId}`);
    return schemaId;
  }
  
  /**
   * Get collection schema ID
   */
  public getSchemaId(): string | null {
    return this.schemaId;
  }
  
  /**
   * Set collection schema ID
   */
  public setSchemaId(schemaId: string): void {
    this.schemaId = schemaId;
  }
  
  /**
   * Write records to the vault
   * In a real implementation, this would encrypt and distribute data across nodes
   */
  public async writeRecords(schemaId: string, records: any[]): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.collections[schemaId]) {
      this.collections[schemaId] = [];
    }
    
    const createdIds: string[] = [];
    
    // Process each record
    for (const record of records) {
      // Generate ID if not provided
      const id = record._id || uuidv4();
      
      // In a real implementation, this would encrypt fields marked with %allot
      // Here we're simulating the encryption by replacing with %share
      const processedRecord = this.simulateEncryption(record, id);
      
      // Store record
      this.collections[schemaId].push(processedRecord);
      createdIds.push(id);
    }
    
    console.log(`Wrote ${records.length} records to collection ${schemaId}`);
    
    // Return a response similar to what the actual API would return
    return {
      data: {
        created: createdIds
      }
    };
  }
  
  /**
   * Read records from the vault
   * In a real implementation, this would retrieve and decrypt data from multiple nodes
   */
  public async readRecords(schemaId: string, filter: any = {}): Promise<any[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.collections[schemaId]) {
      return [];
    }
    
    // Retrieve records (in a real implementation, this would query across nodes)
    const records = this.collections[schemaId];
    
    // Simulate decryption of records
    const decryptedRecords = records.map(record => this.simulateDecryption(record));
    
    console.log(`Read ${decryptedRecords.length} records from collection ${schemaId}`);
    
    return decryptedRecords;
  }
  
  /**
   * Simulate encryption of sensitive fields
   */
  private simulateEncryption(record: any, id: string): any {
    const result: any = { _id: id };
    
    // Process each field
    for (const [key, value] of Object.entries(record)) {
      if (key === '_id') continue;
      
      if (key === 'years_in_web3' && typeof value === 'object' && '%allot' in value) {
        // Simulate encryption of years_in_web3
        result[key] = { '%share': `encrypted-${value['%allot']}` };
      } else {
        // Keep non-sensitive data as is
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Simulate decryption of encrypted fields
   */
  private simulateDecryption(record: any): any {
    const result: any = { _id: record._id };
    
    // Process each field
    for (const [key, value] of Object.entries(record)) {
      if (key === '_id') continue;
      
      if (key === 'years_in_web3' && typeof value === 'object' && '%share' in value) {
        // Simulate decryption
        const encrypted = value['%share'] as string;
        const originalValue = parseInt(encrypted.replace('encrypted-', ''), 10);
        result[key] = originalValue;
      } else {
        // Keep non-sensitive data as is
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Create a demo Web3 experience survey collection
   */
  public async createDemoSurveyCollection(): Promise<string> {
    const schemaId = await this.createCollection(WEB3_SURVEY_SCHEMA);
    return schemaId;
  }
  
  /**
   * Add demo survey data
   */
  public async addDemoSurveyData(schemaId: string): Promise<any> {
    const surveyData = [
      {
        years_in_web3: { '%allot': 2 },
        responses: [
          { rating: 4, question_number: 1 },
          { rating: 5, question_number: 2 },
        ]
      },
      {
        years_in_web3: { '%allot': 5 },
        responses: [
          { rating: 3, question_number: 1 },
          { rating: 4, question_number: 2 },
        ]
      }
    ];
    
    return this.writeRecords(schemaId, surveyData);
  }
}

// Export singleton instance
export const secretVaultService = SecretVaultService.getInstance(); 