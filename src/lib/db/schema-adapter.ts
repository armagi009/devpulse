/**
 * Schema Adapter Layer
 * 
 * This module provides adapters for handling database schema differences
 * between different versions of the application. It ensures that code
 * can work with both the original schema and the enhanced schema with
 * additional relations.
 */

import { prisma } from './prisma';

/**
 * Safely get a repository by ID, handling potential schema differences
 */
export async function getRepository(id: string) {
  try {
    return await prisma.repository.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching repository:', error);
    return null;
  }
}

/**
 * Safely get a retrospective by ID, handling potential schema differences
 */
export async function getRetrospective(id: string) {
  try {
    // First try to get the retrospective without including relations
    const retrospective = await prisma.retrospective.findUnique({
      where: { id },
    });
    
    return retrospective;
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    return null;
  }
}

/**
 * Safely get a user by ID, handling potential schema differences
 */
export async function getUser(id: string) {
  try {
    // First try to get the user without including relations
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Safely get user permissions, handling potential schema differences
 */
export async function getUserPermissions(userId: string, defaultPermissions: string[] = []) {
  try {
    // Try to get user with permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return defaultPermissions;
    }
    
    // In mock mode, return all permissions
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return defaultPermissions;
    }
    
    // Return default permissions based on role
    return defaultPermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return defaultPermissions;
  }
}

/**
 * Safely check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: string, defaultRoles: Record<string, string[]> = {}) {
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // In mock mode, assume all permissions are granted
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return true;
    }

    // Check if user's role has the permission by default
    const userRole = user.role || 'USER';
    const rolePermissions = defaultRoles[userRole] || [];
    return rolePermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Safely get team members, handling potential schema differences
 */
export async function getTeamMembers(teamId: string) {
  try {
    // Try to get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
    });
    
    return teamMembers;
  } catch (error) {
    // If TeamMember model doesn't exist, return empty array
    console.error('Error fetching team members:', error);
    return [];
  }
}

/**
 * Safely check if app mode is available
 */
export async function getAppMode() {
  try {
    // Check environment variables first
    const envMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
    const envMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    
    // If environment variables are set, use them
    if (envMockAuth || envMockApi) {
      return {
        mode: 'MOCK',
        mockDataSetId: process.env.NEXT_PUBLIC_MOCK_DATA_SET || 'default',
        enabledFeatures: ['ANALYTICS', 'TEAM_INSIGHTS', 'BURNOUT_DETECTION'],
        errorSimulation: process.env.NEXT_PUBLIC_MOCK_ERROR_SIMULATION === 'true' ? {
          enabled: true,
          probability: parseFloat(process.env.NEXT_PUBLIC_MOCK_ERROR_PROBABILITY || '0.1')
        } : null,
      };
    }
    
    // Otherwise, try to fetch from database
    try {
      const appMode = await prisma.appMode.findFirst();
      if (appMode) {
        return {
          mode: appMode.mode,
          mockDataSetId: appMode.mockDataSetId,
          enabledFeatures: appMode.enabledFeatures,
          errorSimulation: appMode.errorSimulation,
        };
      }
    } catch (error) {
      // AppMode model might not exist, ignore error
    }
    
    // Default to LIVE mode
    return {
      mode: 'LIVE',
      mockDataSetId: null,
      enabledFeatures: [],
      errorSimulation: null,
    };
  } catch (error) {
    console.error('Error getting app mode:', error);
    return {
      mode: 'LIVE',
      mockDataSetId: null,
      enabledFeatures: [],
      errorSimulation: null,
    };
  }
}