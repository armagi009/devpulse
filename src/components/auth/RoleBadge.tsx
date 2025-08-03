'use client';

import React from 'react';
import { UserRole } from '@/lib/types/roles';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Component to display a user's role as a badge
 */
export function RoleBadge({ role, size = 'md', className = '' }: RoleBadgeProps) {
  // Define colors based on role
  const roleColors = {
    [UserRole.ADMINISTRATOR]: 'bg-purple-100 text-purple-800 border-purple-300',
    [UserRole.TEAM_LEAD]: 'bg-blue-100 text-blue-800 border-blue-300',
    [UserRole.DEVELOPER]: 'bg-green-100 text-green-800 border-green-300',
  };

  // Define size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  // Get color and size classes
  const colorClass = roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClass} ${sizeClass} font-medium ${className}`}
    >
      {role}
    </span>
  );
}

interface RoleBadgeListProps {
  roles: UserRole[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Component to display multiple roles as badges
 */
export function RoleBadgeList({ roles, size = 'md', className = '' }: RoleBadgeListProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {roles.map((role) => (
        <RoleBadge key={role} role={role} size={size} />
      ))}
    </div>
  );
}