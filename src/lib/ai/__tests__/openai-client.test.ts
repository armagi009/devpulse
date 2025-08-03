/**
 * OpenAI Client Tests
 */

import OpenAI from 'openai';
import { getOpenAIClient, isOpenAIAvailable, generateCompletion, generateStructuredData } from '../openai-client';
import { env } from '@/lib/utils/env';

// Mock OpenAI
jest.mock('openai');
jest.mock('@/lib/utils/env');

describe('OpenAI Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock env
    (env as jest.Mock).mockReturnValue({
      OPENAI_API_KEY: 'test-api-key',
      OPENAI_MODEL: 'gpt-4',
    });
  });

  describe('getOpenAIClient', () => {
    it('creates a new OpenAI client with the API key', () => {
      // Call the function
      const client = getOpenAIClient();
      
      // Check that OpenAI constructor was called with the correct API key
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });
      
      // Check that the client was returned
      expect(client).toBeDefined();
    });

    it('throws an error if API key is not configured', () => {
      // Mock env to return no API key
      (env as jest.Mock).mockReturnValue({
        OPENAI_API_KEY: '',
      });
      
      // Call the function and expect it to throw
      expect(() => getOpenAIClient()).toThrow('OpenAI API key is not configured');
    });

    it('returns the same client instance on subsequent calls', () => {
      // Call the function twice
      const client1 = getOpenAIClient();
      const client2 = getOpenAIClient();
      
      // Check that OpenAI constructor was called only once
      expect(OpenAI).toHaveBeenCalledTimes(1);
      
      // Check that the same client was returned
      expect(client1).toBe(client2);
    });
  });

  describe('isOpenAIAvailable', () => {
    it('returns true if OpenAI API is available', async () => {
      // Mock OpenAI client
      const mockClient = {
        models: {
          list: jest.fn().mockResolvedValue([]),
        },
      };
      (OpenAI as jest.Mock).mockReturnValue(mockClient);
      
      // Call the function
      const result = await isOpenAIAvailable();
      
      // Check that models.list was called
      expect(mockClient.models.list).toHaveBeenCalled();
      
      // Check that the function returned true
      expect(result).toBe(true);
    });

    it('returns false if OpenAI API is not available', async () => {
      // Mock OpenAI client to throw an error
      const mockClient = {
        models: {
          list: jest.fn().mockRejectedValue(new Error('API error')),
        },
      };
      (OpenAI as jest.Mock).mockReturnValue(mockClient);
      
      // Call the function
      const result = await isOpenAIAvailable();
      
      // Check that models.list was called
      expect(mockClient.models.list).toHaveBeenCalled();
      
      // Check that the function returned false
      expect(result).toBe(false);
    });
  });

  describe('generateCompletion', () => {
    it('generates a text completion using OpenAI API', async () => {
      // Mock OpenAI client
      const mockClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Generated text',
                  },
                },
              ],
            }),
          },
        },
      };
      (OpenAI as jest.Mock).mockReturnValue(mockClient);
      
      // Call the function
      const result = await generateCompletion('Test prompt');
      
      // Check that completions.create was called with the correct parameters
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides concise and accurate information.' },
          { role: 'user', content: 'Test prompt' },
        ],
        temperature: 0.7,
        max_tokens: undefined,
      });
      
      // Check that the function returned the generated text
      expect(result).toBe('Generated text');
    });

    it('throws an error if OpenAI API fails', async () => {
      // Mock OpenAI client to throw an error
      const mockClient = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API error')),
          },
        },
      };
      (OpenAI as jest.Mock).mockReturnValue(mockClient);
      
      // Call the function and expect it to throw
      await expect(generateCompletion('Test prompt')).rejects.toThrow('API error');
    });
  });

  describe('generateStructuredData', () => {
    it('generates structured data using OpenAI API', async () => {
      // Mock OpenAI client
      const mockClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: '{"key": "value"}',
                  },
                },
              ],
            }),
          },
        },
      };
      (OpenAI as jest.Mock).mockReturnValue(mockClient);
      
      // Call the function
      const result = await generateStructuredData<{ key: string }>(
        'Test prompt',
        '{"key": "string"}'
      );
      
      // Check that completions.create was called with the correct parameters
      expect(mockClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: expect.any(Array),
        temperature: 0.7,
        max_tokens: undefined,
        response_format: { type: 'json_object' },
      });
      
      // Check that the function returned the parsed JSON
      expect(result).toEqual({ key: 'value' });
    });

    it('throws an error if JSON parsing fails', async () => {
      // Mock OpenAI client to return invalid JSON
      const mockClient = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: 'Not JSON',
                  },
                },
              ],
            }),
          },
        },
      };
      (OpenAI as jest.Mock).mockReturnValue(mockClient);
      
      // Call the function and expect it to throw
      await expect(generateStructuredData('Test prompt', '{}')).rejects.toThrow('Failed to parse AI response as JSON');
    });
  });
});