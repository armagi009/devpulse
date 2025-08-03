'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, PERMISSIONS } from '@/lib/types/roles';
import { useRolePermissions } from '@/lib/hooks/usePermissions';
import { RoleBadge } from './RoleBadge';

interface PermissionManagerProps {
  userId: string;
  userName: string;
  userRole: UserRole;
  initialPermissions: string[];
  onUpdate?: (success: boolean) => void;
}

export function PermissionManager({
  userId,
  userName,
  userRole,
  initialPermissions,
  onUpdate,
}: PermissionManagerProps) {
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get default permissions for the role
  const rolePermissions = useRolePermissions(userRole);
  
  // Calculate custom permissions (granted beyond role defaults)
  const customPermissions = permissions.filter(p => !rolePermissions.includes(p));
  
  // Calculate available permissions (not already granted)
  const availablePermissions = Object.values(PERMISSIONS).filter(
    p => !permissions.includes(p)
  );

  // Handle permission toggle
  const togglePermission = async (permission: string, shouldGrant: boolean) => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/auth/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          permissions: [permission],
          action: shouldGrant ? 'grant' : 'revoke',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPermissions(data.permissions);
        setSuccess(`Permission ${shouldGrant ? 'granted' : 'revoked'} successfully`);
        if (onUpdate) onUpdate(true);
      } else {
        throw new Error('Operation failed');
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      setError(`Failed to ${shouldGrant ? 'grant' : 'revoke'} permission`);
      if (onUpdate) onUpdate(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{userName}</h3>
          <div className="flex items-center mt-1">
            <RoleBadge role={userRole} />
            <span className="ml-2 text-sm text-gray-500">User ID: {userId}</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">Role-based Permissions</h4>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {rolePermissions.map(permission => (
              <span 
                key={permission} 
                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200"
              >
                {permission}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These permissions are automatically granted based on the user's role.
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-medium mb-2">Custom Permissions</h4>
        {customPermissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {customPermissions.map(permission => (
              <div 
                key={permission} 
                className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded border border-purple-200 flex items-center"
              >
                <span>{permission}</span>
                <button
                  onClick={() => togglePermission(permission, false)}
                  disabled={isUpdating}
                  className="ml-2 text-purple-500 hover:text-purple-700"
                  title="Revoke permission"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No custom permissions granted.</p>
        )}
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Grant Additional Permissions</h4>
        {availablePermissions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availablePermissions.map(permission => (
              <button
                key={permission}
                onClick={() => togglePermission(permission, true)}
                disabled={isUpdating}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded border border-gray-300"
              >
                + {permission}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">All permissions have been granted.</p>
        )}
      </div>
    </div>
  );
}