/**
 * GunDB Server Configuration
 * 
 * This file controls which modules are loaded and how GunDB is configured.
 * Modify the 'modules' section to enable/disable specific Gun.js components.
 */
module.exports = {
  port: process.env.PORT || 8765,
  
  gunOptions: {
    // Core Gun Options
    file: 'gun-data',        // Local file storage path
    radisk: false,           // Enable file storage engine
    serverStorage: true,     // Use server-optimized storage with individual JSON files
    localStorage: false,     // Don't use localStorage in Node.js
    multicast: false,        // Disable multicast DNS discovery
    axe: false,              // Disable Axe P2P discovery
    
    // Performance Tuning
    memory: {                // Memory management
      max: 300 * 1000 * 1000, // 300MB memory limit
      force: false,          // Don't force clean memory
      limit: 100000          // Limit for number of nodes to keep in memory
    },
    batch: 10,               // Batch writes
    chunk: 1024 * 100,       // Save chunks to disk at this size
    
    // Network Configuration
    peers: [],               // Array of peer URLs to connect to
    web: null,               // Express/HTTP server (will be set in server.js)
    
    // Auth and Security
    secure: false,           // Use HTTPS (set to true if you provide key/cert)
    verify: null,            // Function to verify messages
    
    // Server Behavior
    super: true,             // Set to true to allow server to be a "super peer"
    faith: true,             // Set to true to increase performance (fewer checks)
    
    // Logging
    log: {
      level: 'debug',        // Log level: debug, info, warn, error
      handler: console.log   // Custom log handler
    },
    
    // Advanced Options
    retry: 12,               // How many times to retry failed operations
    gap: 100,                // Gap for throttling in milliseconds
    wait: 300                // Wait time for writes
  }
};
