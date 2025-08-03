'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { RoleBadge } from '@/components/auth/RoleBadge';
import { PermissionManager } from '@/components/auth/PermissionManager';
import { AdminOnly, TeamLeadOnly } from '@/components/auth/RoleBasedRender';
import { UserRole, PERMISSIONS } from '@/lib/types/roles';

export default function PermissionsPage() {
  const { data: session } = useSession();
  const { permissions, userRole, isLoading } = usePermissions();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users (admin only)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [session]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse bg-gray-200 h-8 w-48 mb-4 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-full mb-2 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-1/2 mb-2 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Permissions Management</h1>
      
      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Permissions</h2>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">Role:</span>
            {userRole && <RoleBadge role={userRole} />}
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Your Permissions:</h3>
            <div className="flex flex-wrap gap-2">
              {permissions.map(permission => (
                <span 
                  key={permission}
                  className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-200"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Role-based sections */}
      <AdminOnly>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User Management (Admin Only)</h2>
          
          {isLoadingUsers ? (
            <div className="animate-pulse space-y-4">
              <div className="bg-gray-200 h-20 rounded"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <PermissionManager
                  key={user.id}
                  userId={user.id}
                  userName={user.name || user.username}
                  userRole={user.role as UserRole}
                  initialPermissions={user.permissions?.map(p => p.name) || []}
                />
              ))}
              
              {users.length === 0 && (
                <p className="text-gray-500">No users found.</p>
              )}
            </div>
          )}
        </div>
      </AdminOnly>
      
      <TeamLeadOnly>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Team Permissions (Team Lead+)</h2>
          <p className="text-gray-600">
            As a team lead, you can manage permissions for your team members.
            This section demonstrates conditional rendering based on user role.
          </p>
        </div>
      </TeamLeadOnly>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Permissions Documentation</h2>
        <p className="text-gray-600 mb-4">
          This page demonstrates role-based access control and permission management.
          Different sections are visible based on your role and permissions.
        </p>
        
        <h3 className="font-medium mb-2">Available Permissions:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          {Object.entries(PERMISSIONS).map(([key, value]) => (
            <li key={key}>
              <span className="font-mono bg-gray-100 px-1 rounded">{value}</span>: {key.toLowerCase().replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}