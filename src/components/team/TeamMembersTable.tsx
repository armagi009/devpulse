'use client';

/**
 * Team Members Table Component
 * Displays and manages team members
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TeamRole } from '@/lib/types/roles';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  username: string;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  user: User;
}

interface TeamMembersTableProps {
  teamId: string;
  members: TeamMember[];
  currentUserId: string;
}

export default function TeamMembersTable({ teamId, members, currentUserId }: TeamMembersTableProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      setIsLoading(memberId);
      
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update member role');
      }
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating member role:', error);
      alert('Failed to update member role. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    // Confirm before removing
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }
    
    try {
      setIsLoading(memberId);
      
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error removing team member:', error);
      alert('Failed to remove team member. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };
  
  // Format role for display
  const formatRole = (role: string) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };
  
  // Get role badge style
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'LEAD':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'MEMBER':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Member
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    {member.user.avatarUrl ? (
                      <Image
                        src={member.user.avatarUrl}
                        alt={member.user.name || 'User avatar'}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                        {(member.user.name || member.user.username || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.user.name || member.user.username}
                      {member.userId === currentUserId && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.user.email || `@${member.user.username}`}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeStyle(member.role)}`}>
                  {formatRole(member.role)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {member.userId !== currentUserId && (
                  <div className="flex justify-end space-x-2">
                    <select
                      className="text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={isLoading === member.id}
                    >
                      <option value={TeamRole.MEMBER}>Member</option>
                      <option value={TeamRole.LEAD}>Lead</option>
                      <option value={TeamRole.ADMIN}>Admin</option>
                    </select>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isLoading === member.id}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          
          {members.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No team members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}