/**
 * Mock API Simulator
 * 
 * This module provides utilities for simulating realistic API behavior,
 * including configurable latency, error rates, and progressive loading.
 */

// Configuration for API simulation
export interface ApiSimulationConfig {
  // Whether to simulate network latency
  simulateLatency: boolean;
  
  // Latency range in milliseconds
  latency: {
    min: number;
    max: number;
  };
  
  // Whether to simulate errors
  simulateErrors: boolean;
  
  // Probability of an error occurring (0-1)
  errorRate: number;
  
  // Status codes to use for simulated errors
  errorStatusCodes: number[];
  
  // Whether to simulate progressive loading for large datasets
  progressiveLoading: boolean;
  
  // Chunk size for progressive loading
  chunkSize: number;
  
  // Whether to log simulated API calls
  logCalls: boolean;
}

// Default configuration
export const DEFAULT_SIMULATION_CONFIG: ApiSimulationConfig = {
  simulateLatency: true,
  latency: {
    min: 100,
    max: 500,
  },
  simulateErrors: false,
  errorRate: 0.1, // 10% chance of error
  errorStatusCodes: [400, 401, 403, 404, 500, 502, 503],
  progressiveLoading: false,
  chunkSize: 20,
  logCalls: true,
};

// Error response for simulated API errors
export interface SimulatedErrorResponse {
  status: number;
  statusText: string;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

/**
 * Simulate network latency
 * 
 * @param config API simulation configuration
 * @returns Promise that resolves after the simulated latency
 */
export async function simulateLatency(config: ApiSimulationConfig = DEFAULT_SIMULATION_CONFIG): Promise<void> {
  if (!config.simulateLatency) {
    return;
  }
  
  const latency = Math.floor(
    Math.random() * (config.latency.max - config.latency.min) + config.latency.min
  );
  
  return new Promise(resolve => setTimeout(resolve, latency));
}

/**
 * Determine if an error should be simulated
 * 
 * @param config API simulation configuration
 * @returns True if an error should be simulated
 */
export function shouldSimulateError(config: ApiSimulationConfig = DEFAULT_SIMULATION_CONFIG): boolean {
  if (!config.simulateErrors) {
    return false;
  }
  
  return Math.random() < config.errorRate;
}

/**
 * Get a random error status code
 * 
 * @param config API simulation configuration
 * @returns A random error status code
 */
export function getRandomErrorStatusCode(config: ApiSimulationConfig = DEFAULT_SIMULATION_CONFIG): number {
  const index = Math.floor(Math.random() * config.errorStatusCodes.length);
  return config.errorStatusCodes[index];
}

/**
 * Generate a simulated error response
 * 
 * @param path API path
 * @param config API simulation configuration
 * @returns Simulated error response
 */
export function generateErrorResponse(
  path: string,
  config: ApiSimulationConfig = DEFAULT_SIMULATION_CONFIG
): SimulatedErrorResponse {
  const status = getRandomErrorStatusCode(config);
  
  // Generate appropriate error message based on status code
  let error = 'Internal Server Error';
  let message = 'An unexpected error occurred while processing your request.';
  
  switch (status) {
    case 400:
      error = 'Bad Request';
      message = 'The request was malformed or contains invalid parameters.';
      break;
    case 401:
      error = 'Unauthorized';
      message = 'Authentication is required to access this resource.';
      break;
    case 403:
      error = 'Forbidden';
      message = 'You do not have permission to access this resource.';
      break;
    case 404:
      error = 'Not Found';
      message = 'The requested resource could not be found.';
      break;
    case 429:
      error = 'Too Many Requests';
      message = 'Rate limit exceeded. Please try again later.';
      break;
    case 500:
      error = 'Internal Server Error';
      message = 'An unexpected error occurred while processing your request.';
      break;
    case 502:
      error = 'Bad Gateway';
      message = 'The server received an invalid response from an upstream server.';
      break;
    case 503:
      error = 'Service Unavailable';
      message = 'The server is currently unavailable. Please try again later.';
      break;
  }
  
  return {
    status,
    statusText: error,
    error,
    message,
    path,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulate an API call with configurable behavior
 * 
 * @param path API path
 * @param responseData Data to return if no error is simulated
 * @param config API simulation configuration
 * @returns Promise that resolves with the response data or rejects with an error
 */
export async function simulateApiCall<T>(
  path: string,
  responseData: T,
  config: ApiSimulationConfig = DEFAULT_SIMULATION_CONFIG
): Promise<T> {
  // Log the API call
  if (config.logCalls) {
    console.log(`🔧 Mock API Call: ${path}`);
    
    // Dispatch custom event for the dev mode indicator
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mockApiCall', {
        detail: {
          timestamp: new Date(),
          method: 'GET', // Default to GET
          path,
        }
      }));
    }
  }
  
  // Simulate latency
  await simulateLatency(config);
  
  // Simulate errors
  if (shouldSimulateError(config)) {
    const errorResponse = generateErrorResponse(path, config);
    throw new Error(JSON.stringify(errorResponse));
  }
  
  // Return the response data
  return responseData;
}

/**
 * Simulate progressive loading of data
 * 
 * @param data Full data array
 * @param config API simulation configuration
 * @returns Promise that resolves with a function to get the next chunk
 */
export async function simulateProgressiveLoading<T>(
  data: T[],
  config: ApiSimulationConfig = DEFAULT_SIMULATION_CONFIG
): Promise<{
  getNextChunk: () => Promise<{ data: T[]; done: boolean }>;
  getTotalCount: () => number;
}> {
  // If progressive loading is disabled, return all data at once
  if (!config.progressiveLoading) {
    return {
      getNextChunk: async () => ({ data, done: true }),
      getTotalCount: () => data.length,
    };
  }
  
  let currentIndex = 0;
  const totalCount = data.length;
  
  // Function to get the next chunk of data
  const getNextChunk = async (): Promise<{ data: T[]; done: boolean }> => {
    // Simulate latency for each chunk
    await simulateLatency(config);
    
    // Simulate errors
    if (shouldSimulateError(config)) {
      const errorResponse = generateErrorResponse('progressive-loading', config);
      throw new Error(JSON.stringify(errorResponse));
    }
    
    // Get the next chunk of data
    const endIndex = Math.min(currentIndex + config.chunkSize, totalCount);
    const chunk = data.slice(currentIndex, endIndex);
    
    // Update the current index
    currentIndex = endIndex;
    
    // Return the chunk and whether we're done
    return {
      data: chunk,
      done: currentIndex >= totalCount,
    };
  };
  
  // Return the functions to get the next chunk and total count
  return {
    getNextChunk,
    getTotalCount: () => totalCount,
  };
}

/**
 * Create a simulated API response with pagination
 * 
 * @param data Full data array
 * @param page Page number (1-based)
 * @param pageSize Number of items per page
 * @returns Paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
} {
  // Ensure page is at least 1
  page = Math.max(1, page);
  
  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get the data for the current page
  const pageData = data.slice(startIndex, endIndex);
  
  // Return the paginated response
  return {
    data: pageData,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}