/**
 * Development Mode Configuration
 * 
 * This module provides configuration for development mode features like
 * mock authentication and mock API responses, including production mock mode.
 */

export interface DevModeConfig {
  useMockAuth: boolean;
  useMockApi: boolean;
  mockApiDelay: number;
  mockApiErrorRate: number;
  debugMode: boolean;
}

// Default configuration
const defaultConfig: DevModeConfig = {
  useMockAuth: false,
  useMockApi: false,
  mockApiDelay: 300,
  mockApiErrorRate: 0,
  debugMode: false,
};

/**
 * Get the development mode configuration
 * 
 * This function checks for configuration in localStorage (client-side)
 * and environment variables (server-side), with production mock mode support.
 * 
 * @returns The current development mode configuration
 */
export function getDevModeConfig(): DevModeConfig {
  // Start with default config
  const config = { ...defaultConfig };
  
  // Check for production mock mode first
  const isProductionMockMode = isProductionMockModeEnabled();
  
  if (isProductionMockMode) {
    config.useMockAuth = true;
    config.useMockApi = true;
    config.debugMode = false; // Keep debug off in production
  } else if (process.env.NODE_ENV === 'development') {
    // Always enable mock mode in development environment
    config.useMockAuth = true;
    config.useMockApi = true;
    config.debugMode = true;
  }
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Client-side: Check localStorage (only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const storedConfig = localStorage.getItem('devModeConfig');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          Object.assign(config, parsedConfig);
        }
        
        // Also check for individual flags that might be set
        if (localStorage.getItem('mockMode') === 'true') {
          config.useMockAuth = true;
          config.useMockApi = true;
        }
        
        if (localStorage.getItem('mockAuth') === 'true') {
          config.useMockAuth = true;
        }
        
        if (localStorage.getItem('mockApi') === 'true') {
          config.useMockApi = true;
        }
        
        if (localStorage.getItem('debugMode') === 'true') {
          config.debugMode = true;
        }
        
        // Force enable for localhost
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
          config.useMockAuth = true;
          config.useMockApi = true;
        }
      } catch (error) {
        console.error('Error reading dev mode config from localStorage:', error);
      }
    }
  } else {
    // Server-side: Check environment variables
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      config.useMockAuth = true;
      config.useMockApi = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      config.useMockAuth = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API === 'true' || process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
      config.useMockApi = true;
    }
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      config.debugMode = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API_DELAY || process.env.MOCK_API_DELAY) {
      config.mockApiDelay = parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY || process.env.MOCK_API_DELAY, 10);
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API_ERROR_RATE || process.env.MOCK_API_ERROR_RATE) {
      config.mockApiErrorRate = parseFloat(process.env.NEXT_PUBLIC_MOCK_API_ERROR_RATE || process.env.MOCK_API_ERROR_RATE);
    }
  }
  
  return config;
}

/**
 * Check if production mock mode is enabled
 * 
 * @returns True if production mock mode should be enabled
 */
export function isProductionMockModeEnabled(): boolean {
  return process.env.NODE_ENV === 'production' && 
         (process.env.ENABLE_PRODUCTION_MOCK === 'true' || 
          process.env.NEXT_PUBLIC_ENABLE_PRODUCTION_MOCK === 'true' ||
          process.env.VERCEL === '1' || 
          !process.env.DATABASE_URL?.includes('localhost'));
}

/**
 * Update the development mode configuration
 * 
 * This function updates the configuration in localStorage (client-side only).
 * 
 * @param updates Partial configuration updates to apply
 * @returns The updated configuration
 */
export function updateDevModeConfig(updates: Partial<DevModeConfig>): DevModeConfig {
  // Only works client-side and in development
  if (typeof window === 'undefined') {
    throw new Error('updateDevModeConfig can only be called client-side');
  }
  
  if (process.env.NODE_ENV === 'production') {
    console.warn('Cannot update dev mode config in production');
    return getDevModeConfig();
  }
  
  // Get current config
  const currentConfig = getDevModeConfig();
  
  // Apply updates
  const updatedConfig = {
    ...currentConfig,
    ...updates,
  };
  
  // Save to localStorage
  try {
    localStorage.setItem('devModeConfig', JSON.stringify(updatedConfig));
    
    // Also update individual flags for backward compatibility
    localStorage.setItem('mockMode', (updatedConfig.useMockAuth && updatedConfig.useMockApi).toString());
    localStorage.setItem('mockAuth', updatedConfig.useMockAuth.toString());
    localStorage.setItem('mockApi', updatedConfig.useMockApi.toString());
    localStorage.setItem('debugMode', updatedConfig.debugMode.toString());
  } catch (error) {
    console.error('Error saving dev mode config to localStorage:', error);
  }
  
  return updatedConfig;
}

/**
 * Helper functions for mock mode detection
 */
export function shouldUseMockAuth(): boolean {
  const config = getDevModeConfig();
  return config.useMockAuth;
}

export function shouldUseMockApi(): boolean {
  const config = getDevModeConfig();
  return config.useMockApi;
}

export function isDebugMode(): boolean {
  const config = getDevModeConfig();
  return config.debugMode;
}

/**
 * Get mock mode message for UI display
 */
export function getMockModeMessage(): string {
  if (isProductionMockModeEnabled()) {
    return 'Demo Mode - Using Simulated Data for Demonstration';
  }
  
  const config = getDevModeConfig();
  if (config.useMockAuth || config.useMockApi) {
    return 'Development Mock Mode Active';
  }
  
  return '';
}

/**
 * Log the current development mode status
 */
export function logDevModeStatus(): void {
  const config = getDevModeConfig();
  const isProductionMock = isProductionMockModeEnabled();
  
  console.log('Development Mode Status:');
  console.log(`- Environment: ${process.env.NODE_ENV}`);
  console.log(`- Production Mock Mode: ${isProductionMock ? 'Enabled' : 'Disabled'}`);
  console.log(`- Mock Auth: ${config.useMockAuth ? 'Enabled' : 'Disabled'}`);
  console.log(`- Mock API: ${config.useMockApi ? 'Enabled' : 'Disabled'}`);
  console.log(`- Debug Mode: ${config.debugMode ? 'Enabled' : 'Disabled'}`);
  console.log(`- Mock API Delay: ${config.mockApiDelay}ms`);
  console.log(`- Mock API Error Rate: ${config.mockApiErrorRate * 100}%`);
}

/**
 * Validate the development mode configuration
 * 
 * @returns Array of error messages, empty if no errors
 */
export function validateDevModeConfig(): string[] {
  const config = getDevModeConfig();
  const errors: string[] = [];
  
  // Check for invalid values
  if (config.mockApiDelay < 0) {
    errors.push('Mock API delay cannot be negative');
  }
  
  if (config.mockApiErrorRate < 0 || config.mockApiErrorRate > 1) {
    errors.push('Mock API error rate must be between 0 and 1');
  }
  
  return errors;
}

// Export the config object for convenience
export const config = getDevModeConfig();
