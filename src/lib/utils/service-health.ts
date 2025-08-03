/**
 * Service Health Monitoring
 * Tracks the health of external services and provides status information
 */

import { getCircuitBreaker } from './circuit-breaker';
import { logError } from './error-handler';

// Service health status
export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown',
}

// Service health check result
interface HealthCheckResult {
  status: ServiceStatus;
  latency?: number;
  message?: string;
  timestamp: number;
}

// Service health information
interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  lastCheck: number;
  checkHistory: HealthCheckResult[];
  checkInterval: number;
  checkTimer?: NodeJS.Timeout;
}

// Service health registry
const serviceRegistry = new Map<string, ServiceHealth>();

// Maximum history length
const MAX_HISTORY_LENGTH = 10;

/**
 * Register a service for health monitoring
 */
export function registerService(
  name: string,
  checkFn: () => Promise<HealthCheckResult>,
  checkInterval: number = 60000 // Default: 1 minute
): void {
  // Create service health entry
  const serviceHealth: ServiceHealth = {
    name,
    status: ServiceStatus.UNKNOWN,
    lastCheck: 0,
    checkHistory: [],
    checkInterval,
  };
  
  // Add to registry
  serviceRegistry.set(name, serviceHealth);
  
  // Start health check
  startHealthCheck(name, checkFn);
}

/**
 * Start health check for a service
 */
function startHealthCheck(
  name: string,
  checkFn: () => Promise<HealthCheckResult>
): void {
  const service = serviceRegistry.get(name);
  
  if (!service) {
    return;
  }
  
  // Clear existing timer
  if (service.checkTimer) {
    clearInterval(service.checkTimer);
  }
  
  // Create check function
  const performCheck = async () => {
    try {
      // Get circuit breaker state
      const circuitBreaker = getCircuitBreaker(name);
      const circuitState = circuitBreaker.getState();
      
      // If circuit is open, mark as unhealthy
      if (circuitState === 'OPEN') {
        updateServiceHealth(name, {
          status: ServiceStatus.UNHEALTHY,
          message: 'Circuit breaker is open',
          timestamp: Date.now(),
        });
        return;
      }
      
      // Perform health check
      const startTime = Date.now();
      const result = await checkFn();
      const endTime = Date.now();
      
      // Add latency if not provided
      if (!result.latency) {
        result.latency = endTime - startTime;
      }
      
      // Update service health
      updateServiceHealth(name, result);
    } catch (error) {
      // Log error
      logError(error, {}, `HealthCheck:${name}`);
      
      // Update service health
      updateServiceHealth(name, {
        status: ServiceStatus.UNHEALTHY,
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: Date.now(),
      });
    }
  };
  
  // Perform initial check
  performCheck();
  
  // Set up interval
  service.checkTimer = setInterval(performCheck, service.checkInterval);
}

/**
 * Update service health
 */
function updateServiceHealth(name: string, result: HealthCheckResult): void {
  const service = serviceRegistry.get(name);
  
  if (!service) {
    return;
  }
  
  // Update status
  service.status = result.status;
  service.lastCheck = result.timestamp;
  
  // Add to history
  service.checkHistory.unshift(result);
  
  // Trim history
  if (service.checkHistory.length > MAX_HISTORY_LENGTH) {
    service.checkHistory = service.checkHistory.slice(0, MAX_HISTORY_LENGTH);
  }
  
  // Log status change if needed
  const previousStatus = service.checkHistory[1]?.status;
  if (previousStatus && previousStatus !== result.status) {
    console.log(`Service ${name} status changed from ${previousStatus} to ${result.status}`);
    
    // If service recovered, reset circuit breaker
    if (previousStatus === ServiceStatus.UNHEALTHY && result.status === ServiceStatus.HEALTHY) {
      const circuitBreaker = getCircuitBreaker(name);
      circuitBreaker.reset();
      console.log(`Reset circuit breaker for ${name}`);
    }
  }
}

/**
 * Get service health
 */
export function getServiceHealth(name: string): ServiceHealth | undefined {
  return serviceRegistry.get(name);
}

/**
 * Get all service health
 */
export function getAllServiceHealth(): ServiceHealth[] {
  return Array.from(serviceRegistry.values());
}

/**
 * Check if a service is healthy
 */
export function isServiceHealthy(name: string): boolean {
  const service = serviceRegistry.get(name);
  return service?.status === ServiceStatus.HEALTHY;
}

/**
 * Register GitHub API health check
 */
export function registerGitHubHealthCheck(): void {
  registerService(
    'github-api',
    async () => {
      try {
        // Import dynamically to avoid circular dependencies
        const { getGitHubApiClient } = await import('@/lib/github/github-api-client');
        const client = getGitHubApiClient();
        
        // Check rate limit as a simple health check
        const startTime = Date.now();
        const rateLimit = await client.getRateLimitStatus();
        const endTime = Date.now();
        
        // Check if rate limit is close to being exceeded
        const remaining = rateLimit.rate.remaining;
        const limit = rateLimit.rate.limit;
        const percentRemaining = (remaining / limit) * 100;
        
        if (percentRemaining < 10) {
          return {
            status: ServiceStatus.DEGRADED,
            latency: endTime - startTime,
            message: `Rate limit low: ${remaining}/${limit} (${percentRemaining.toFixed(1)}%)`,
            timestamp: Date.now(),
          };
        }
        
        return {
          status: ServiceStatus.HEALTHY,
          latency: endTime - startTime,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          status: ServiceStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'GitHub API health check failed',
          timestamp: Date.now(),
        };
      }
    },
    5 * 60 * 1000 // Check every 5 minutes
  );
}

/**
 * Register OpenAI API health check
 */
export function registerOpenAIHealthCheck(): void {
  registerService(
    'openai-api',
    async () => {
      try {
        // Import dynamically to avoid circular dependencies
        const { isOpenAIAvailable } = await import('@/lib/ai/openai-client');
        
        // Check if OpenAI is available
        const startTime = Date.now();
        const available = await isOpenAIAvailable();
        const endTime = Date.now();
        
        if (!available) {
          return {
            status: ServiceStatus.UNHEALTHY,
            latency: endTime - startTime,
            message: 'OpenAI API is not available',
            timestamp: Date.now(),
          };
        }
        
        return {
          status: ServiceStatus.HEALTHY,
          latency: endTime - startTime,
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          status: ServiceStatus.UNHEALTHY,
          message: error instanceof Error ? error.message : 'OpenAI API health check failed',
          timestamp: Date.now(),
        };
      }
    },
    15 * 60 * 1000 // Check every 15 minutes
  );
}

/**
 * Initialize service health monitoring
 */
export function initializeServiceHealthMonitoring(): void {
  registerGitHubHealthCheck();
  // Skip OpenAI health check if AI features are disabled
  if (process.env.ENABLE_AI_FEATURES === 'true') {
    registerOpenAIHealthCheck();
  }
}