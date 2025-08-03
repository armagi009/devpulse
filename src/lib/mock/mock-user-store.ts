/**
 * Mock User Store
 * 
 * This module provides storage and management for mock users.
 * It allows for persisting the currently selected mock user and
 * managing user sessions during development.
 */

import { MockUser } from '../types/mock';
import { getMockUserById, getMockUsers, getRandomMockUser } from './mock-users';

// Key for storing the current mock user ID in localStorage
const CURRENT_MOCK_USER_KEY = 'devpulse_current_mock_user';

/**
 * Get the currently selected mock user
 * @returns The current mock user or a random one if none is selected
 */
export function getCurrentMockUser(): MockUser {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return getRandomMockUser();
  }
  
  try {
    const storedUserId = localStorage.getItem(CURRENT_MOCK_USER_KEY);
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      const user = getMockUserById(userId);
      if (user) {
        return user;
      }
    }
    
    // If no user is stored or the stored user doesn't exist, select a random one
    const randomUser = getRandomMockUser();
    setCurrentMockUser(randomUser.id);
    return randomUser;
  } catch (error) {
    // In case of any errors (e.g., localStorage not available), return a random user
    return getRandomMockUser();
  }
}

/**
 * Set the current mock user by ID
 * @param userId ID of the mock user to set as current
 * @returns The selected mock user or undefined if not found
 */
export function setCurrentMockUser(userId: number): MockUser | undefined {
  const user = getMockUserById(userId);
  
  if (!user) {
    return undefined;
  }
  
  // Store the user ID if we're in a browser environment
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CURRENT_MOCK_USER_KEY, userId.toString());
    } catch (error) {
      console.error('Failed to store mock user in localStorage:', error);
    }
  }
  
  return user;
}

/**
 * Clear the currently selected mock user
 */
export function clearCurrentMockUser(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CURRENT_MOCK_USER_KEY);
    } catch (error) {
      console.error('Failed to clear mock user from localStorage:', error);
    }
  }
}

/**
 * Get all available mock users with an indicator for the currently selected one
 * @returns Array of mock users with a 'current' flag
 */
export function getAvailableMockUsers(): (MockUser & { current: boolean })[] {
  const users = getMockUsers();
  const currentUser = getCurrentMockUser();
  
  return users.map(user => ({
    ...user,
    current: user.id === currentUser.id
  }));
}