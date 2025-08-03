/**
 * Mock Users
 * 
 * This module provides mock user profiles for development and testing.
 * It includes predefined users with different characteristics and utility
 * functions for accessing and managing these users.
 */

import { MockUser } from '../types/mock';
import { User } from '../types/auth';

/**
 * Predefined mock users with different characteristics
 */
export const mockUsers: MockUser[] = [
  {
    id: 1001,
    login: 'regular-dev',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1001',
    html_url: 'https://github.com/regular-dev',
    role: 'developer',
    workPattern: 'regular',
    activityLevel: 'medium',
    collaborationStyle: 'team-player',
    responseTime: 'average',
    workHours: 'standard',
    specialties: ['frontend', 'react', 'typescript']
  },
  {
    id: 1002,
    login: 'overworked-lead',
    name: 'Sam Taylor',
    email: 'sam.taylor@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1002',
    html_url: 'https://github.com/overworked-lead',
    role: 'team-lead',
    workPattern: 'overworked',
    activityLevel: 'high',
    collaborationStyle: 'mentor',
    responseTime: 'fast',
    workHours: 'late-night',
    specialties: ['backend', 'architecture', 'devops']
  },
  {
    id: 1003,
    login: 'night-coder',
    name: 'Jamie Rivera',
    email: 'jamie.rivera@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1003',
    html_url: 'https://github.com/night-coder',
    role: 'developer',
    workPattern: 'irregular',
    activityLevel: 'high',
    collaborationStyle: 'independent',
    responseTime: 'slow',
    workHours: 'late-night',
    specialties: ['algorithms', 'performance', 'backend']
  },
  {
    id: 1004,
    login: 'balanced-dev',
    name: 'Morgan Chen',
    email: 'morgan.chen@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1004',
    html_url: 'https://github.com/balanced-dev',
    role: 'developer',
    workPattern: 'regular',
    activityLevel: 'medium',
    collaborationStyle: 'team-player',
    responseTime: 'average',
    workHours: 'standard',
    specialties: ['fullstack', 'testing', 'documentation']
  },
  {
    id: 1005,
    login: 'weekend-warrior',
    name: 'Casey Kim',
    email: 'casey.kim@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1005',
    html_url: 'https://github.com/weekend-warrior',
    role: 'contributor',
    workPattern: 'irregular',
    activityLevel: 'medium',
    collaborationStyle: 'independent',
    responseTime: 'slow',
    workHours: 'weekend',
    specialties: ['bug-fixing', 'refactoring']
  },
  {
    id: 1006,
    login: 'early-bird',
    name: 'Robin Patel',
    email: 'robin.patel@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1006',
    html_url: 'https://github.com/early-bird',
    role: 'developer',
    workPattern: 'regular',
    activityLevel: 'high',
    collaborationStyle: 'mentor',
    responseTime: 'fast',
    workHours: 'early-morning',
    specialties: ['ui/ux', 'accessibility', 'design-systems']
  },
  {
    id: 1007,
    login: 'manager-user',
    name: 'Jordan Smith',
    email: 'jordan.smith@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1007',
    html_url: 'https://github.com/manager-user',
    role: 'manager',
    workPattern: 'regular',
    activityLevel: 'low',
    collaborationStyle: 'mentor',
    responseTime: 'slow',
    workHours: 'standard',
    specialties: ['project-management', 'planning']
  },
  {
    id: 1008,
    login: 'burnout-risk',
    name: 'Taylor Rodriguez',
    email: 'taylor.rodriguez@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1008',
    html_url: 'https://github.com/burnout-risk',
    role: 'developer',
    workPattern: 'overworked',
    activityLevel: 'high',
    collaborationStyle: 'independent',
    responseTime: 'fast',
    workHours: 'late-night',
    specialties: ['backend', 'database', 'api-design']
  },
  {
    id: 1009,
    login: 'underutilized-dev',
    name: 'Riley Garcia',
    email: 'riley.garcia@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1009',
    html_url: 'https://github.com/underutilized-dev',
    role: 'developer',
    workPattern: 'underutilized',
    activityLevel: 'low',
    collaborationStyle: 'team-player',
    responseTime: 'average',
    workHours: 'standard',
    specialties: ['documentation', 'testing']
  },
  {
    id: 1010,
    login: 'new-hire',
    name: 'Quinn Wilson',
    email: 'quinn.wilson@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1010',
    html_url: 'https://github.com/new-hire',
    role: 'developer',
    workPattern: 'regular',
    activityLevel: 'medium',
    collaborationStyle: 'team-player',
    responseTime: 'fast',
    workHours: 'standard',
    specialties: ['learning', 'small-tasks']
  }
];

/**
 * Get all available mock users
 * @returns Array of mock users
 */
export function getMockUsers(): MockUser[] {
  return mockUsers;
}

/**
 * Get a mock user by ID
 * @param id User ID (can be number or string)
 * @returns Mock user or undefined if not found
 */
export function getMockUserById(id: number | string): MockUser | undefined {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  return mockUsers.find(user => user.id === numericId);
}

/**
 * Get a mock user by login name
 * @param login GitHub login name
 * @returns Mock user or undefined if not found
 */
export function getMockUserByLogin(login: string): MockUser | undefined {
  return mockUsers.find(user => user.login === login);
}

/**
 * Get mock users by role
 * @param role User role
 * @returns Array of mock users with the specified role
 */
export function getMockUsersByRole(role: MockUser['role']): MockUser[] {
  return mockUsers.filter(user => user.role === role);
}

/**
 * Get mock users by work pattern
 * @param pattern Work pattern
 * @returns Array of mock users with the specified work pattern
 */
export function getMockUsersByWorkPattern(pattern: MockUser['workPattern']): MockUser[] {
  return mockUsers.filter(user => user.workPattern === pattern);
}

/**
 * Convert a mock user to the application's User type
 * @param mockUser Mock user to convert
 * @returns User object compatible with the application
 */
export function convertMockUserToUser(mockUser: MockUser): User {
  return {
    id: mockUser.id.toString(),
    githubId: mockUser.id,
    username: mockUser.login,
    email: mockUser.email,
    avatarUrl: mockUser.avatar_url,
    name: mockUser.name,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Get a random mock user
 * @returns Random mock user
 */
export function getRandomMockUser(): MockUser {
  const randomIndex = Math.floor(Math.random() * mockUsers.length);
  return mockUsers[randomIndex];
}

/**
 * Get mock users with specific characteristics
 * @param filters Object with characteristics to filter by
 * @returns Array of mock users matching the filters
 */
export function filterMockUsers(filters: Partial<MockUser>): MockUser[] {
  return mockUsers.filter(user => {
    return Object.entries(filters).every(([key, value]) => {
      return user[key as keyof MockUser] === value;
    });
  });
}