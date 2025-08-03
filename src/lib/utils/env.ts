/**
 * Environment Variables
 * Type-safe access to environment variables
 */

// Define the shape of our environment variables
interface Env {
  // Base configuration
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;
  
  // Authentication
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  GITHUB_ID: string;
  GITHUB_SECRET: string;
  
  // Database
  DATABASE_URL: string;
  
  // Redis (optional)
  REDIS_URL?: string;
  
  // OpenAI (optional)
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  
  // Feature flags
  ENABLE_AI_FEATURES: boolean;
  ENABLE_TEAM_ANALYTICS: boolean;
  ENABLE_BACKGROUND_JOBS: boolean;
  
  // Development mode configuration
  USE_MOCK_AUTH: boolean;
  USE_MOCK_API: boolean;
  MOCK_DATA_SET: string;
  SHOW_DEV_MODE_INDICATOR: boolean;
  LOG_MOCK_CALLS: boolean;
}

// Default values for development
const defaultEnv: Env = {
  NODE_ENV: 'development',
  APP_URL: 'http://localhost:3000',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'development-secret',
  GITHUB_ID: '',
  GITHUB_SECRET: '',
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/devpulse',
  ENABLE_AI_FEATURES: false,
  ENABLE_TEAM_ANALYTICS: true,
  ENABLE_BACKGROUND_JOBS: true,
  USE_MOCK_AUTH: false,
  USE_MOCK_API: false,
  MOCK_DATA_SET: 'default',
  SHOW_DEV_MODE_INDICATOR: true,
  LOG_MOCK_CALLS: true,
};

// Helper function to parse boolean environment variables
function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

// Get environment variables with type safety and defaults
export function getEnv(): Env {
  return {
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || defaultEnv.NODE_ENV,
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || defaultEnv.APP_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || defaultEnv.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || defaultEnv.NEXTAUTH_SECRET,
    GITHUB_ID: process.env.GITHUB_ID || defaultEnv.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET || defaultEnv.GITHUB_SECRET,
    DATABASE_URL: process.env.DATABASE_URL || defaultEnv.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
    ENABLE_AI_FEATURES: parseBoolean(process.env.ENABLE_AI_FEATURES) || defaultEnv.ENABLE_AI_FEATURES,
    ENABLE_TEAM_ANALYTICS: parseBoolean(process.env.ENABLE_TEAM_ANALYTICS) || defaultEnv.ENABLE_TEAM_ANALYTICS,
    ENABLE_BACKGROUND_JOBS: parseBoolean(process.env.ENABLE_BACKGROUND_JOBS) || defaultEnv.ENABLE_BACKGROUND_JOBS,
    
    // Development mode configuration
    USE_MOCK_AUTH: parseBoolean(process.env.NEXT_PUBLIC_USE_MOCK_AUTH) || defaultEnv.USE_MOCK_AUTH,
    USE_MOCK_API: parseBoolean(process.env.NEXT_PUBLIC_USE_MOCK_API) || defaultEnv.USE_MOCK_API,
    MOCK_DATA_SET: process.env.NEXT_PUBLIC_MOCK_DATA_SET || defaultEnv.MOCK_DATA_SET,
    SHOW_DEV_MODE_INDICATOR: process.env.NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR !== 'false',
    LOG_MOCK_CALLS: process.env.NEXT_PUBLIC_LOG_MOCK_CALLS !== 'false',
  };
}

// Singleton instance of environment variables
let envInstance: Env;

// Get environment variables (singleton pattern)
export function env(): Env {
  if (!envInstance) {
    envInstance = getEnv();
  }
  return envInstance;
}

// Validate required environment variables in production
export function validateEnv(): void {
  const environment = env();
  
  if (environment.NODE_ENV === 'production') {
    const requiredVars = [
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GITHUB_ID',
      'GITHUB_SECRET',
      'DATABASE_URL',
    ];
    
    const missingVars = requiredVars.filter(
      (name) => !process.env[name]
    );
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }
}