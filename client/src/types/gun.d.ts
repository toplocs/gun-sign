// Type definitions for Gun.js

// User interface represents a Gun.js user in the application
export type GunUser = {
  alias: string;
  
  // The public key of the user for cryptographic operations
  pub: string;
  
  // Authentication timestamp
  _?: {
    sea: any; // Gun SEA encryption key pair
    [key: string]: any; // Other Gun.js internal properties
  };

  // Any additional properties that might be stored in Gun user object
  [key: string]: any;
}

declare module 'gun' {
  // Add missing .once method to Gun user instance
  interface IGunUserInstance<TNode, TData, TGun, TRoot> {
    once(cb: (data: User) => void): any;
  }

  interface IGunInstance<T> {
    lookup?(key: string, id: string): Promise<any>;
  }
}

// Declare global SEA namespace for Gun/SEA
declare global {
  const SEA: {
    sign: (data: any, pair: any) => Promise<any>;
    verify: (data: any, pub: string) => Promise<any>;
    // Add other SEA methods as needed
  };
}

// Type for Gun.js acknowledgment responses
export type GunAck = {
  err?: string;
  ok?: number;
  pub?: string;
  soul?: string;
  get?: string;
  put?: Record<string, any>;
  sea?: Record<string, any>;
  [key: string]: any;
}