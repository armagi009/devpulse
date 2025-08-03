/**
 * Components for role-based UI rendering
 */

'use client';

import React from 'react';
import { usePermissions, useCanAccess, useIsAdmin, useIsTeamLead } from '@/lib/hooks/usePermissions';
import { UserRole } from '@/lib/types/roles';

interface RoleBasedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render content only for administrators
 */
export function AdminOnly({ children, fallback = null }: RoleBasedProps) {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Render content only for team leads or administrators
 */
export function TeamLeadOnly({ children, fallback = null }: RoleBasedProps) {
  const isTeamLead = useIsTeamLead();
  
  if (!isTeamLead) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface RoleRequiredProps extends RoleBasedProps {
  role: UserRole;
}

/**
 * Render content only for users with a specific role
 */
export function RoleRequired({ role, children, fallback = null }: RoleRequiredProps) {
  const { hasRole } = usePermissions();
  
  if (!hasRole(role)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface PermissionRequiredProps extends RoleBasedProps {
  permission: string;
}

/**
 * Render content only for users with a specific permission
 */
export function PermissionRequired({ permission, children, fallback = null }: PermissionRequiredProps) {
  const canAccess = useCanAccess(permission);
  
  if (!canAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface AnyPermissionRequiredProps extends RoleBasedProps {
  permissions: string[];
}

/**
 * Render content if user has any of the specified permissions
 */
export function AnyPermissionRequired({ permissions, children, fallback = null }: AnyPermissionRequiredProps) {
  const { hasPermission } = usePermissions();
  
  const canAccess = permissions.some(permission => hasPermission(permission));
  
  if (!canAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface AllPermissionsRequiredProps extends RoleBasedProps {
  permissions: string[];
}

/**
 * Render content only if user has all specified permissions
 */
export function AllPermissionsRequired({ permissions, children, fallback = null }: AllPermissionsRequiredProps) {
  const { hasPermission } = usePermissions();
  
  const canAccess = permissions.every(permission => hasPermission(permission));
  
  if (!canAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}