/**
 * API Client Factory
 * 
 * This module provides a factory function to get the appropriate API client
 * based on the current application mode (live, mock, demo).
 */

import { AppMode } from '@/lib/types/roles';
import {
  ApiSimulationConfig,
  DEFAULT_SIMULATION_CONFIG,
  simulateLatency,
  shouldSimulateError,
  generateErrorResponse,
  simulateApiCall,
  simulateProgressiveLoading,
} from '@/lib/mock/mock-api-simulator';

// Base interface for API clients
export interface ApiClient {
  // Base method to make API requests
  request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  
  // Helper methods for common HTTP methods
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data?: any): Promise<T>;
  patch<T>(endpoint: string, data?: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

// Options for API requests
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// Error simulation options
export interface ErrorSimulationOptions {
  enabled: boolean;
  rate: number;
  statusCodes?: number[];
  endpoints?: string[];
}

/**
 * Live API Client implementation
 * Makes real API requests to the server
 */
class LiveApiClient implements ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Make an API request
   * 
   * @param endpoint API endpoint path
   * @param options Request options
   * @returns Promise with the response data
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      params,
      data,
      headers = {},
      signal,
    } = options;
    
    // Build the URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal,
    };
    
    // Add body for non-GET requests
    if (method !== 'GET' && data !== undefined) {
      fetchOptions.body = JSON.stringify(data);
    }
    
    // Make the request
    const response = await fetch(url, fetchOptions);
    
    // Handle errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || 'API request failed',
        response.status,
        errorData
      );
    }
    
    // Parse and return the response
    return response.json();
  }
  
  /**
   * Make a GET request
   * 
   * @param endpoint API endpoint path
   * @param params Query parameters
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }
  
  /**
   * Make a POST request
   * 
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }
  
  /**
   * Make a PUT request
   * 
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Promise with the response data
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }
  
  /**
   * Make a PATCH request
   * 
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Promise with the response data
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }
  
  /**
   * Make a DELETE request
   * 
   * @param endpoint API endpoint path
   * @returns Promise with the response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Mock API Client implementation
 * Simulates API requests with mock data
 */
class MockApiClient implements ApiClient {
  private baseUrl: string;
  private errorSimulation: ErrorSimulationOptions;
  private mockDataSetId: string | null;
  private mockResponses: Record<string, any>;
  private simulationConfig: ApiSimulationConfig;
  
  constructor(
    baseUrl: string = '/api',
    mockDataSetId: string | null = null,
    errorSimulation: ErrorSimulationOptions = { enabled: false, rate: 0 }
  ) {
    this.baseUrl = baseUrl;
    this.mockDataSetId = mockDataSetId;
    this.errorSimulation = errorSimulation;
    this.mockResponses = {};
    
    // Initialize simulation config
    this.simulationConfig = {
      ...DEFAULT_SIMULATION_CONFIG,
      simulateErrors: errorSimulation.enabled,
      errorRate: errorSimulation.rate,
    };
    
    // Initialize with some default mock responses
    this.loadMockResponses();
  }
  
  /**
   * Load mock responses based on the mock data set
   */
  private loadMockResponses(): void {
    // This would typically load mock data from a JSON file or similar
    // For now, we'll just use some hardcoded examples
    this.mockResponses = {
      '/health': { status: 'ok', version: '1.0.0' },
      // Add more mock responses as needed
    };
  }
  
  /**
   * Simulate an API request
   * 
   * @param endpoint API endpoint path
   * @param options Request options
   * @returns Promise with the mock response data
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const fullPath = `${this.baseUrl}${endpoint}`;
    
    // Get mock response for this endpoint
    const mockResponse = this.getMockResponse(endpoint, options);
    
    try {
      // Use the mock API simulator to simulate realistic API behavior
      const response = await simulateApiCall<T>(
        fullPath,
        mockResponse as T,
        this.simulationConfig
      );
      
      return response;
    } catch (error) {
      // Parse the error response
      let errorData: any;
      try {
        errorData = JSON.parse((error as Error).message);
      } catch {
        errorData = { status: 500, error: 'Internal Server Error' };
      }
      
      // Throw an ApiError with the parsed error data
      throw new ApiError(
        errorData.error || 'Simulated API error',
        errorData.status || 500,
        errorData
      );
    }
  }
  
  /**
   * Get a mock response for an endpoint
   * 
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Mock response data
   */
  private getMockResponse(endpoint: string, options: RequestOptions): any {
    // Check if we have a hardcoded mock response for this endpoint
    if (this.mockResponses[endpoint]) {
      return this.mockResponses[endpoint];
    }
    
    // If not, generate a dynamic mock response
    return this.generateMockResponse(endpoint, options);
  }
  
  /**
   * Generate a dynamic mock response for an endpoint
   * 
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Generated mock response
   */
  private generateMockResponse(endpoint: string, options: RequestOptions): any {
    // This would typically generate mock data based on the endpoint and options
    // For now, we'll just return a simple success response
    return {
      success: true,
      mockDataSetId: this.mockDataSetId,
      endpoint,
      method: options.method || 'GET',
      timestamp: new Date().toISOString(),
    };
  }
  
  /**
   * Make a GET request
   * 
   * @param endpoint API endpoint path
   * @param params Query parameters
   * @returns Promise with the response data
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }
  
  /**
   * Make a POST request
   * 
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }
  
  /**
   * Make a PUT request
   * 
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Promise with the response data
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }
  
  /**
   * Make a PATCH request
   * 
   * @param endpoint API endpoint path
   * @param data Request body data
   * @returns Promise with the response data
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }
  
  /**
   * Make a DELETE request
   * 
   * @param endpoint API endpoint path
   * @returns Promise with the response data
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Demo API Client implementation
 * Provides curated responses for demonstration purposes
 */
class DemoApiClient extends MockApiClient {
  constructor(
    baseUrl: string = '/api',
    errorSimulation: ErrorSimulationOptions = { enabled: false, rate: 0 }
  ) {
    super(baseUrl, 'demo', errorSimulation);
    
    // Override mock responses with demo-specific ones
    this.loadDemoResponses();
  }
  
  /**
   * Load demo-specific responses
   */
  private loadDemoResponses(): void {
    // This would load demo-specific responses
    // These would be carefully curated for presentations
  }
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Cache for client instances
let liveClientInstance: LiveApiClient | null = null;
let mockClientInstance: MockApiClient | null = null;
let demoClientInstance: DemoApiClient | null = null;

/**
 * Get the appropriate API client based on the application mode
 * 
 * @param mode Application mode
 * @param options Options for the API client
 * @returns API client instance
 */
export function getApiClient(
  mode: AppMode,
  options: {
    baseUrl?: string;
    mockDataSetId?: string | null;
    errorSimulation?: ErrorSimulationOptions;
  } = {}
): ApiClient {
  const {
    baseUrl = '/api',
    mockDataSetId = null,
    errorSimulation = { enabled: false, rate: 0 },
  } = options;
  
  switch (mode) {
    case AppMode.MOCK:
      // Return cached instance or create new one
      if (!mockClientInstance) {
        mockClientInstance = new MockApiClient(baseUrl, mockDataSetId, errorSimulation);
      }
      return mockClientInstance;
      
    case AppMode.DEMO:
      // Return cached instance or create new one
      if (!demoClientInstance) {
        demoClientInstance = new DemoApiClient(baseUrl, errorSimulation);
      }
      return demoClientInstance;
      
    case AppMode.LIVE:
    default:
      // Return cached instance or create new one
      if (!liveClientInstance) {
        liveClientInstance = new LiveApiClient(baseUrl);
      }
      return liveClientInstance;
  }
}

/**
 * Reset all API client instances
 * This is useful for testing and when switching between modes
 */
export function resetApiClients(): void {
  liveClientInstance = null;
  mockClientInstance = null;
  demoClientInstance = null;
}