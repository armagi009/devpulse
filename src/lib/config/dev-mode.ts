/**
 * Development Mode Configuration
 * 
 * This module provides configuration for development mode features like
 * mock authentication and mock API responses.
 */

interface DevModeConfig {
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
 * and environment variables (server-side).
 * 
 * @returns The current development mode configuration
 */
export function getDevModeConfig(): DevModeConfig {
  // Start with default config
  const config = { ...defaultConfig };
  
  // Always enable mock mode in development environment
  if (process.env.NODE_ENV === 'development') {
    config.useMockAuth = true;
    config.useMockApi = true;
    config.debugMode = true;
  }
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Client-side: Check localStorage
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
  } else {
    // Server-side: Check environment variables
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
      config.useMockAuth = true;
      config.useMockApi = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
      config.useMockAuth = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API === 'true') {
      config.useMockApi = true;
    }
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      config.debugMode = true;
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API_DELAY) {
      config.mockApiDelay = parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY, 10);
    }
    
    if (process.env.NEXT_PUBLIC_MOCK_API_ERROR_RATE) {
      config.mockApiErrorRate = parseFloat(process.env.NEXT_PUBLIC_MOCK_API_ERROR_RATE);
    }
  }
  
  console.log('Dev mode config:', config);
  return config;
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
  // Only works client-side
  if (typeof window === 'undefined') {
    throw new Error('updateDevModeConfig can only be called client-side');
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
 * Log the current development mode status
 */
export function logDevModeStatus(): void {
  const config = getDevModeConfig();
  
  console.log('Development Mode Status:');
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
  
  // Check for production mode with development features enabled
  if (process.env.NODE_ENV === 'production') {
    if (config.useMockAuth) {
      errors.push('Mock authentication should not be enabled in production');
    }
    
    if (config.useMockApi) {
      errors.push('Mock API should not be enabled in production');
    }
    
    if (config.debugMode) {
      errors.push('Debug mode should not be enabled in production');
    }
  }
  
  return errors;
}

// Export the config object for convenience
export const config = getDevModeConfig();