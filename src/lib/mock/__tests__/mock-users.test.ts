/**
 * Tests for mock users functionality
 */

import { describe, it, expect } from 'vitest';
import { 
  getMockUsers, 
  getMockUserById, 
  getMockUserByLogin,
  getMockUsersByRole,
  getMockUsersByWorkPattern,
  convertMockUserToUser,
  getRandomMockUser,
  filterMockUsers
} from '../mock-users';

describe('Mock Users', () => {
  it('should return all mock users', () => {
    const users = getMockUsers();
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThan(0);
  });

  it('should find a user by ID', () => {
    const user = getMockUserById(1001);
    expect(user).toBeDefined();
    expect(user?.login).toBe('regular-dev');
  });

  it('should return undefined for non-existent user ID', () => {
    const user = getMockUserById(9999);
    expect(user).toBeUndefined();
  });

  it('should find a user by login', () => {
    const user = getMockUserByLogin('overworked-lead');
    expect(user).toBeDefined();
    expect(user?.id).toBe(1002);
  });

  it('should filter users by role', () => {
    const developers = getMockUsersByRole('developer');
    expect(developers.length).toBeGreaterThan(0);
    expect(developers.every(user => user.role === 'developer')).toBe(true);
  });

  it('should filter users by work pattern', () => {
    const overworkedUsers = getMockUsersByWorkPattern('overworked');
    expect(overworkedUsers.length).toBeGreaterThan(0);
    expect(overworkedUsers.every(user => user.workPattern === 'overworked')).toBe(true);
  });

  it('should convert mock user to application user', () => {
    const mockUser = getMockUserById(1001);
    if (!mockUser) {
      throw new Error('Mock user not found');
    }
    
    const user = convertMockUserToUser(mockUser);
    expect(user.id).toBe(mockUser.id.toString());
    expect(user.githubId).toBe(mockUser.id);
    expect(user.username).toBe(mockUser.login);
    expect(user.email).toBe(mockUser.email);
    expect(user.avatarUrl).toBe(mockUser.avatar_url);
    expect(user.name).toBe(mockUser.name);
  });

  it('should return a random mock user', () => {
    const user = getRandomMockUser();
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
  });

  it('should filter users by multiple characteristics', () => {
    const filteredUsers = filterMockUsers({
      role: 'developer',
      workPattern: 'regular'
    });
    
    expect(filteredUsers.length).toBeGreaterThan(0);
    expect(filteredUsers.every(user => 
      user.role === 'developer' && user.workPattern === 'regular'
    )).toBe(true);
  });
});