/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by stopping calls to failing services
 */

enum CircuitState {
  CLOSED, // Normal operation, requests are allowed
  OPEN,   // Circuit is open, requests are not allowed
  HALF_OPEN // Testing if service is back online
}

interface CircuitBreakerOptions {
  failureThreshold: number;   // Number of failures before opening circuit
  resetTimeout: number;       // Time in ms before trying again (half-open state)
  maxHalfOpenCalls: number;   // Max calls in half-open state
  timeout?: number;           // Request timeout in ms
  onOpen?: () => void;        // Callback when circuit opens
  onClose?: () => void;       // Callback when circuit closes
  onHalfOpen?: () => void;    // Callback when circuit goes half-open
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private halfOpenCalls: number = 0;
  
  private options: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
    maxHalfOpenCalls: 3,
    timeout: 10000, // 10 seconds
  };
  
  constructor(options?: Partial<CircuitBreakerOptions>) {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit is open, requests are not allowed');
      }
      
      // Move to half-open state
      this.halfOpen();
    }
    
    if (this.state === CircuitState.HALF_OPEN && this.halfOpenCalls >= this.options.maxHalfOpenCalls) {
      throw new Error('Maximum half-open calls reached');
    }
    
    // If we're in half-open state, increment the call counter
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
    }
    
    try {
      // Execute the function with timeout
      const result = await this.executeWithTimeout(fn);
      
      // Success - reset failure count
      this.onSuccess();
      
      return result;
    } catch (error) {
      // Failure - increment failure count
      this.onFailure();
      throw error;
    }
  }
  
  /**
   * Execute a function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.options.timeout) {
      return fn();
    }
    
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.options.timeout);
      }),
    ]);
  }
  
  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.options.maxHalfOpenCalls) {
        this.close();
      }
    }
  }
  
  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount++;
    
    if (this.state === CircuitState.HALF_OPEN || 
        (this.state === CircuitState.CLOSED && this.failureCount >= this.options.failureThreshold)) {
      this.open();
    }
  }
  
  /**
   * Open the circuit
   */
  private open(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.options.resetTimeout;
    
    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }
  
  /**
   * Close the circuit
   */
  private close(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }
  
  /**
   * Set circuit to half-open state
   */
  private halfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    
    if (this.options.onHalfOpen) {
      this.options.onHalfOpen();
    }
  }
  
  /**
   * Get current circuit state
   */
  getState(): string {
    switch (this.state) {
      case CircuitState.CLOSED:
        return 'CLOSED';
      case CircuitState.OPEN:
        return 'OPEN';
      case CircuitState.HALF_OPEN:
        return 'HALF_OPEN';
      default:
        return 'UNKNOWN';
    }
  }
  
  /**
   * Reset the circuit breaker to closed state
   */
  reset(): void {
    this.close();
  }
}

// Circuit breaker instances for different services
const circuitBreakers: Record<string, CircuitBreaker> = {};

/**
 * Get or create a circuit breaker for a specific service
 */
export function getCircuitBreaker(serviceName: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
  if (!circuitBreakers[serviceName]) {
    circuitBreakers[serviceName] = new CircuitBreaker(options);
  }
  
  return circuitBreakers[serviceName];
}

/**
 * Execute a function with circuit breaker protection
 */
export async function executeWithCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  options?: Partial<CircuitBreakerOptions>
): Promise<T> {
  const circuitBreaker = getCircuitBreaker(serviceName, options);
  return circuitBreaker.execute(fn);
}