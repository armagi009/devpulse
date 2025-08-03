/**
 * Server Initialization
 * Handles server startup tasks like database connection and service health monitoring
 */

import { initializeDatabaseConnection } from './db/test-connection';
import { initializeServiceHealthMonitoring } from './utils/service-health';
import { validateEnv } from './utils/env';
import { logDevModeStatus, validateDevModeConfig } from './config/dev-mode';
import { initSchemaAdapter } from './db/init-schema-adapter';

/**
 * Initialize the server
 */
export async function initializeServer(): Promise<void> {
  try {
    // Validate environment variables
    validateEnv();
    
    // Log and validate development mode configuration
    logDevModeStatus();
    const configErrors = validateDevModeConfig();
    if (configErrors.length > 0 && process.env.NODE_ENV === 'production') {
      throw new Error(`Development mode configuration errors in production: ${configErrors.join(', ')}`);
    }

    // Initialize database connection
    await initializeDatabaseConnection();

    // Initialize schema adapter
    await initSchemaAdapter();

    // Initialize service health monitoring
    initializeServiceHealthMonitoring();

    console.log('Server initialization complete');
  } catch (error) {
    console.error('Server initialization failed:', error);

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting due to initialization failure');
      process.exit(1);
    }
  }
}

// If this file is executed directly, initialize the server
if (require.main === module) {
  initializeServer()
    .then(() => {
      console.log('Server initialized successfully');
    })
    .catch((error) => {
      console.error('Error initializing server:', error);
      process.exit(1);
    });
}