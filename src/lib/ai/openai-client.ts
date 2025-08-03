/**
 * OpenAI API Client
 * Handles interactions with the OpenAI API
 */

import OpenAI from 'openai';
import { env } from '@/lib/utils/env';
import { executeWithCircuitBreaker } from '@/lib/utils/circuit-breaker';
import { logError, createAppError } from '@/lib/utils/error-handler';
import { AppError, ErrorCode } from '@/lib/types/api';

// OpenAI client instance
let openaiClient: OpenAI | null = null;

// Cache for availability check
let isAvailableCache: { value: boolean; timestamp: number } | null = null;
const AVAILABILITY_CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get OpenAI client instance
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = env().OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new AppError(
        ErrorCode.AI_SERVICE_UNAVAILABLE,
        'OpenAI API key is not configured',
        503
      );
    }
    
    openaiClient = new OpenAI({
      apiKey,
    });
  }
  
  return openaiClient;
}

/**
 * Check if OpenAI API is available
 */
export async function isOpenAIAvailable(): Promise<boolean> {
  // Check if AI features are enabled
  if (!env().ENABLE_AI_FEATURES) {
    return false;
  }

  // Check if API key is configured
  if (!env().OPENAI_API_KEY) {
    return false;
  }
  
  // Check cache first
  if (isAvailableCache && Date.now() - isAvailableCache.timestamp < AVAILABILITY_CACHE_TTL) {
    return isAvailableCache.value;
  }
  
  try {
    // Try to get client
    const client = getOpenAIClient();
    
    // Make a simple models list request to check if API is available
    // Use circuit breaker to prevent cascading failures
    await executeWithCircuitBreaker(
      'openai-availability',
      async () => await client.models.list(),
      {
        failureThreshold: 2,
        resetTimeout: 30000, // 30 seconds
        timeout: 5000, // 5 seconds
      }
    );
    
    // Update cache
    isAvailableCache = { value: true, timestamp: Date.now() };
    return true;
  } catch (error) {
    // Log error
    logError(error, {}, 'OpenAIAvailabilityCheck');
    
    // Update cache
    isAvailableCache = { value: false, timestamp: Date.now() };
    return false;
  }
}

/**
 * Generate text completion using OpenAI API
 */
export async function generateCompletion(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  try {
    const client = getOpenAIClient();
    
    // Use circuit breaker to prevent cascading failures
    const response = await executeWithCircuitBreaker(
      'openai-completion',
      async () => {
        return client.chat.completions.create({
          model: options.model || env().OPENAI_MODEL || 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides concise and accurate information.' },
            { role: 'user', content: prompt }
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
        });
      },
      {
        failureThreshold: 3,
        resetTimeout: 60000, // 1 minute
        timeout: 30000, // 30 seconds
        onOpen: () => {
          console.warn('OpenAI completion circuit breaker opened');
        },
      }
    );
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    // Log error
    logError(error, { promptLength: prompt.length }, 'OpenAICompletion');
    
    // Convert to AppError
    throw createAppError(error);
  }
}

/**
 * Generate structured data using OpenAI API
 */
export async function generateStructuredData<T>(
  prompt: string,
  schema: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<T> {
  try {
    const client = getOpenAIClient();
    
    const fullPrompt = `
${prompt}

Please provide your response in the following JSON format:
${schema}

Ensure your response is valid JSON that strictly follows this schema.
`;
    
    // Use circuit breaker to prevent cascading failures
    const response = await executeWithCircuitBreaker(
      'openai-structured-data',
      async () => {
        return client.chat.completions.create({
          model: options.model || env().OPENAI_MODEL || 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that provides structured data in JSON format.' },
            { role: 'user', content: fullPrompt }
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
          response_format: { type: 'json_object' },
        });
      },
      {
        failureThreshold: 3,
        resetTimeout: 60000, // 1 minute
        timeout: 30000, // 30 seconds
        onOpen: () => {
          console.warn('OpenAI structured data circuit breaker opened');
        },
      }
    );
    
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      return JSON.parse(content) as T;
    } catch (parseError) {
      // Log parse error
      logError(parseError, { content }, 'OpenAIStructuredDataParse');
      
      throw new AppError(
        ErrorCode.AI_PROCESSING_ERROR,
        'Failed to parse AI response as JSON',
        500
      );
    }
  } catch (error) {
    // Log error
    logError(error, { promptLength: prompt.length, schemaLength: schema.length }, 'OpenAIStructuredData');
    
    // Convert to AppError
    throw createAppError(error);
  }
}