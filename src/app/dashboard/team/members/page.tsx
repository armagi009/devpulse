/**
 * Team Members Management Page
 * Allows team leads to manage team members
 */

import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkPermission } from '@/lib/auth/role-service';
import { PERMISSIONS } from '@/lib/types/roles';
import { prisma } from '@/lib/db/prisma';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TeamMembersTable from '@/components/team/TeamMembersTable';
import TeamMemberInvite from '@/components/team/TeamMemberInvite';

/**
 * Team Members Management Page
 */
export default async function TeamMembersPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Check if user has permission to manage teams
  const hasPermission = await checkPermission(PERMISSIONS.MANAGE_TEAMS);
  
  if (!hasPermission) {
    redirect('/unauthorized');
  }
  
  // Get teams managed by the user
  const managedTeams = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
      role: {
        in: ['LEAD', 'ADMIN'],
      },
    },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                  username: true,
                },
              },
            },
          },
        },
      },
    },
  });
  
  // Get the first team (for now, we'll add team switching later)
  const selectedTeam = managedTeams.length > 0 ? managedTeams[0].team : null;
  
  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          
          {managedTeams.length > 1 && (
            <div className="mt-4 md:mt-0">
              <select 
                className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                defaultValue={selectedTeam?.id}
              >
                {managedTeams.map(teamMember => (
                  <option key={teamMember.team.id} value={teamMember.team.id}>
                    {teamMember.team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {selectedTeam ? (
          <div className="space-y-6">
            {/* Team Information */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">{selectedTeam.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedTeam.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {selectedTeam.members.length} Members
                </span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                  {selectedTeam._count?.repositories || 0} Repositories
                </span>
              </div>
            </Card>
            
            {/* Invite Member */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">Invite Team Member</h2>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <TeamMemberInvite teamId={selectedTeam.id} />
              </Suspense>
            </Card>
            
            {/* Team Members Table */}
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-medium mb-4">Current Members</h2>
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <TeamMembersTable 
                  teamId={selectedTeam.id} 
                  members={selectedTeam.members} 
                  currentUserId={session.user.id}
                />
              </Suspense>
            </Card>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Teams Available</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have any teams yet. Create a team to get started.
            </p>
            <div className="mt-4">
              <a 
                href="/dashboard/team/create" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Team
              </a>
            </div>
          </Card>
        )}
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            As a team lead, you can manage team members, assign roles, and control repository access.
            Team members will only have access to the repositories you explicitly share with the team.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}