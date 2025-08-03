/**
 * React hook for checking user permissions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole, PERMISSIONS } from '@/lib/types/roles';
import { getDevModeConfig } from '@/lib/config/dev-mode';

// Cache for permissions to reduce API calls
const permissionsCache = new Map<string, { permissions: string[]; role: UserRole; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface UsePermissionsResult {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isLoading: boolean;
  userRole: UserRole | null;
  permissions: string[];
  refreshPermissions: () => Promise<void>;
}

export function usePermissions(): UsePermissionsResult {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch permissions
  const fetchPermissions = useCallback(async () => {
    if (status === 'loading' || !session?.user?.id) {
      setPermissions([]);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    const userId = session.user.id;
    const now = Date.now();

    // Check if we're in mock mode
    const config = getDevModeConfig();
    const isMockMode = config.useMockAuth;

    // If we have a role in the session and we're in mock mode, use it directly
    if (isMockMode && session.user.role) {
      console.log(`Using role from session in mock mode: ${session.user.role}`);
      
      // In mock mode, grant all permissions for testing
      const mockPermissions = Object.values(PERMISSIONS);
      setPermissions(mockPermissions);
      
      // Convert string role to proper UserRole enum value
      let roleEnum: UserRole;
      const roleStr = session.user.role.toString().toUpperCase();
      
      if (roleStr === 'ADMINISTRATOR' || roleStr === 'ADMIN') {
        roleEnum = UserRole.ADMINISTRATOR;
      } else if (roleStr === 'TEAM_LEAD' || roleStr === 'LEAD') {
        roleEnum = UserRole.TEAM_LEAD;
      } else {
        roleEnum = UserRole.DEVELOPER;
      }
      
      setUserRole(roleEnum);
      setIsLoading(false);
      
      // Update cache
      permissionsCache.set(userId, {
        permissions: mockPermissions,
        role: roleEnum,
        timestamp: now,
      });
      
      return;
    }

    // Check cache first
    const cachedData = permissionsCache.get(userId);
    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      setPermissions(cachedData.permissions);
      setUserRole(cachedData.role);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/permissions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      const fetchedPermissions = data.permissions || [];
      const fetchedRole = data.role || null;
      
      console.log(`Fetched role from API: ${fetchedRole}`);
      
      // Update state
      setPermissions(fetchedPermissions);
      setUserRole(fetchedRole);
      
      // Update cache
      permissionsCache.set(userId, {
        permissions: fetchedPermissions,
        role: fetchedRole,
        timestamp: now,
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  // Fetch permissions when session changes
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      // In mock mode, always return true for permissions
      const config = getDevModeConfig();
      if (config.useMockAuth) {
        return true;
      }
      
      return permissions.includes(permission);
    },
    [permissions]
  );

  // Check if user has a specific role
  const hasRole = useCallback(
    (role: UserRole): boolean => {
      // In mock mode, always return true for role checks
      const config = getDevModeConfig();
      if (config.useMockAuth) {
        return true;
      }
      
      if (!userRole) return false;
      
      // Compare as strings to avoid enum comparison issues
      const userRoleStr = userRole.toString().toUpperCase();
      const roleStr = role.toString().toUpperCase();
      
      // Handle special cases for role aliases
      if (roleStr === 'ADMINISTRATOR' && (userRoleStr === 'ADMINISTRATOR' || userRoleStr === 'ADMIN')) {
        return true;
      }
      
      if (roleStr === 'TEAM_LEAD' && (userRoleStr === 'TEAM_LEAD' || userRoleStr === 'LEAD')) {
        return true;
      }
      
      if (roleStr === 'DEVELOPER' && (userRoleStr === 'DEVELOPER' || userRoleStr === 'DEV')) {
        return true;
      }
      
      return userRoleStr === roleStr;
    },
    [userRole]
  );

  // Function to manually refresh permissions
  const refreshPermissions = useCallback(async () => {
    // Clear cache for current user
    if (session?.user?.id) {
      permissionsCache.delete(session.user.id);
    }
    await fetchPermissions();
  }, [session, fetchPermissions]);

  return {
    hasPermission,
    hasRole,
    isLoading,
    userRole,
    permissions,
    refreshPermissions,
  };
}

/**
 * React hook for checking if the current user can access a specific feature
 */
export function useCanAccess(permission: string): boolean {
  const { hasPermission, isLoading } = usePermissions();
  
  // In mock mode, always return true
  const config = getDevModeConfig();
  if (config.useMockAuth) {
    return true;
  }
  
  // While loading, assume no access
  if (isLoading) {
    return false;
  }
  
  return hasPermission(permission);
}

/**
 * React hook for checking if the current user is an administrator
 */
export function useIsAdmin(): boolean {
  const { hasRole, isLoading } = usePermissions();
  
  // In mock mode, always return true
  const config = getDevModeConfig();
  if (config.useMockAuth) {
    return true;
  }
  
  // While loading, assume not admin
  if (isLoading) {
    return false;
  }
  
  return hasRole(UserRole.ADMINISTRATOR);
}

/**
 * React hook for checking if the current user is a team lead
 */
export function useIsTeamLead(): boolean {
  const { hasRole, isLoading } = usePermissions();
  
  // In mock mode, always return true
  const config = getDevModeConfig();
  if (config.useMockAuth) {
    return true;
  }
  
  // While loading, assume not team lead
  if (isLoading) {
    return false;
  }
  
  return hasRole(UserRole.TEAM_LEAD) || hasRole(UserRole.ADMINISTRATOR);
}

/**
 * React hook for getting all permissions for a specific role
 */
export function useRolePermissions(role: UserRole): string[] {
  return useMemo(() => {
    const rolePermissions = {
      [UserRole.ADMINISTRATOR]: Object.values(PERMISSIONS),
      [UserRole.TEAM_LEAD]: [
        PERMISSIONS.VIEW_PERSONAL_METRICS,
        PERMISSIONS.VIEW_TEAM_METRICS,
        PERMISSIONS.VIEW_BURNOUT_PERSONAL,
        PERMISSIONS.VIEW_BURNOUT_TEAM,
        PERMISSIONS.MANAGE_REPOSITORIES,
        PERMISSIONS.MANAGE_TEAMS,
        PERMISSIONS.CREATE_RETROSPECTIVES,
      ],
      [UserRole.DEVELOPER]: [
        PERMISSIONS.VIEW_PERSONAL_METRICS,
        PERMISSIONS.VIEW_BURNOUT_PERSONAL,
        PERMISSIONS.MANAGE_REPOSITORIES,
      ],
    };
    
    return rolePermissions[role] || [];
  }, [role]);
}