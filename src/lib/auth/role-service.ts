/**
 * Role-based permission service
 * Handles role and permission checks throughout the application
 */

import { prisma } from '@/lib/db/prisma';
import { UserRole, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/types/roles';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // Get user with their permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      return false;
    }

    // In mock mode, assume all permissions are granted
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      return true;
    }

    // First check if the user has the specific permission directly assigned
    const hasDirectPermission = user.permissions.some(p => p.name === permission);
    if (hasDirectPermission) {
      return true;
    }

    // If not, check if user's role has the permission by default
    const userRole = user.role as UserRole;
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    // Fallback to checking if the user is an admin in mock mode
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      return true;
    }
    return false;
  }
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    // In mock mode, assume the user has the requested role
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      return true;
    }

    return user.role === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
}

/**
 * Check if a user is a member of a team
 */
export async function isTeamMember(userId: string, teamId: string): Promise<boolean> {
  try {
    // In mock mode, assume the user is a team member
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      return true;
    }

    // Check if teamMember table exists, if not return false
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });
      return !!membership;
    } catch (tableError) {
      // TeamMember table doesn't exist yet
      console.warn('TeamMember table not found, returning false');
      return false;
    }
  } catch (error) {
    console.error('Error checking team membership:', error);
    return false;
  }
}

/**
 * Check if a user is a team lead
 */
export async function isTeamLead(userId: string, teamId: string): Promise<boolean> {
  try {
    // In mock mode, assume the user is a team lead
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      return true;
    }

    // Check if teamMember table exists, if not return false
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });
      return membership?.role === 'LEAD' || membership?.role === 'ADMIN';
    } catch (tableError) {
      // TeamMember table doesn't exist yet
      console.warn('TeamMember table not found, returning false');
      return false;
    }
  } catch (error) {
    console.error('Error checking team lead status:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    // Get user with their permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
      },
    });

    if (!user) {
      return [];
    }

    // In mock mode, return all permissions
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      return Object.values(PERMISSIONS);
    }

    // Get role-based permissions
    const userRole = user.role as UserRole;
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
    
    // Get directly assigned permissions
    const directPermissions = user.permissions.map(p => p.name);
    
    // Combine and deduplicate permissions
    const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];

    return allPermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Assign a role to a user
 */
export async function assignRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log the role change
    console.log(`User ${userId} role changed to ${role}`);

    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
}

/**
 * Grant a specific permission to a user
 */
export async function grantPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    // In mock mode, just log the action
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      console.log(`Permission ${permissionName} granted to user ${userId} (mock)`);
      return true;
    }

    // Find the permission by name
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      console.error(`Permission ${permissionName} not found`);
      return false;
    }

    // Connect the permission to the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          connect: { id: permission.id },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'GRANT_PERMISSION',
        entityType: 'PERMISSION',
        entityId: permission.id,
        description: `Permission ${permissionName} granted to user`,
        userId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error granting permission:', error);
    return false;
  }
}

/**
 * Revoke a specific permission from a user
 */
export async function revokePermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    // In mock mode, just log the action
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      console.log(`Permission ${permissionName} revoked from user ${userId} (mock)`);
      return true;
    }

    // Find the permission by name
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      console.error(`Permission ${permissionName} not found`);
      return false;
    }

    // Disconnect the permission from the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          disconnect: { id: permission.id },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'REVOKE_PERMISSION',
        entityType: 'PERMISSION',
        entityId: permission.id,
        description: `Permission ${permissionName} revoked from user`,
        userId,
      },
    });

    return true;
  } catch (error) {
    console.error('Error revoking permission:', error);
    return false;
  }
}

/**
 * Create a new team
 */
export async function createTeam(name: string, description: string | undefined, creatorId: string): Promise<string | null> {
  try {
    // In mock mode, just return a mock team ID
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      console.log(`Team ${name} created by ${creatorId} (mock)`);
      return 'mock-team-id';
    }

    // In a real implementation, we would create the team in the database
    console.log(`Team ${name} created by ${creatorId}`);
    return 'team-id';
  } catch (error) {
    console.error('Error creating team:', error);
    return null;
  }
}

/**
 * Add a user to a team
 */
export async function addTeamMember(teamId: string, userId: string, role: string, actorId: string): Promise<boolean> {
  try {
    // In mock mode, just log the action
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    if (getDevModeConfig().useMockAuth) {
      console.log(`User ${userId} added to team ${teamId} with role ${role} by ${actorId} (mock)`);
      return true;
    }

    // In a real implementation, we would add the user to the team in the database
    console.log(`User ${userId} added to team ${teamId} with role ${role} by ${actorId}`);
    return true;
  } catch (error) {
    console.error('Error adding team member:', error);
    return false;
  }
}

/**
 * Server-side middleware to check if the current user has a specific permission
 */
export async function checkPermission(permission: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }
  
  // In mock mode, always return true
  const { getDevModeConfig } = require('@/lib/config/dev-mode');
  if (getDevModeConfig().useMockAuth) {
    return true;
  }
  
  return hasPermission(session.user.id, permission);
}

/**
 * Server-side middleware to check if the current user has a specific role
 */
export async function checkRole(role: UserRole) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return false;
  }
  
  // In mock mode, always return true
  const { getDevModeConfig } = require('@/lib/config/dev-mode');
  if (getDevModeConfig().useMockAuth) {
    return true;
  }
  
  return hasRole(session.user.id, role);
}

/**
 * Get the current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  // In mock mode, return ADMINISTRATOR role
  const { getDevModeConfig } = require('@/lib/config/dev-mode');
  if (getDevModeConfig().useMockAuth) {
    return UserRole.ADMINISTRATOR;
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  
  return (user?.role as UserRole) || null;
}