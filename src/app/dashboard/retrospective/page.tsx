/**
 * Retrospective Dashboard Page
 * Displays team retrospectives and insights
 */

import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RetrospectiveGenerator from '@/components/retrospective/RetrospectiveGenerator';
import RetrospectiveWizard from '@/components/retrospective/RetrospectiveWizard';
import RetrospectiveList from '@/components/retrospective/RetrospectiveList';

/**
 * Retrospective Dashboard Page
 */
export default async function RetrospectivePage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Get user's repositories
  const repositories = await prisma.repository.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  
  // Get user settings
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  
  // Determine which repository to show
  let selectedRepositoryId = '';
  let selectedRepositoryName = '';
  
  if (userSettings?.selectedRepositories?.length) {
    // Use first selected repository from user settings
    selectedRepositoryId = userSettings.selectedRepositories[0];
    const repo = repositories.find(r => r.id === selectedRepositoryId);
    if (repo) {
      selectedRepositoryName = repo.name;
    }
  } else if (repositories.length > 0) {
    // Use first repository
    selectedRepositoryId = repositories[0].id;
    selectedRepositoryName = repositories[0].name;
  }
  
  // Get recent retrospectives
  const retrospectives = selectedRepositoryId 
    ? await prisma.retrospective.findMany({
        where: {
          repositoryId: selectedRepositoryId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      })
    : [];
  
  // Get team members
  const teamMembers = selectedRepositoryId
    ? await prisma.teamMember.findMany({
        where: {
          teams: {
            some: {
              repositories: {
                some: {
                  id: selectedRepositoryId
                }
              }
            }
          }
        },
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      })
    : [];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">Team Retrospectives</h1>
        
        {repositories.length > 1 && (
          <div className="mt-4 md:mt-0">
            <select 
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              defaultValue={selectedRepositoryId}
            >
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {selectedRepositoryId ? (
        <div className="space-y-8">
          <Tabs defaultValue="wizard" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="wizard">Guided Wizard</TabsTrigger>
              <TabsTrigger value="quick">Quick Create</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wizard">
              <Suspense fallback={<LoadingSkeleton />}>
                <RetrospectiveWizard 
                  repositoryId={selectedRepositoryId} 
                  repositoryName={selectedRepositoryName}
                  teamMembers={teamMembers}
                />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="quick">
              <Suspense fallback={<LoadingSkeleton />}>
                <RetrospectiveGenerator repositoryId={selectedRepositoryId} />
              </Suspense>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Recent Retrospectives</h2>
            <Suspense fallback={<LoadingSkeleton />}>
              <RetrospectiveList 
                repositoryId={selectedRepositoryId} 
                initialRetrospectives={retrospectives}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Repositories Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your GitHub repositories to generate team retrospectives.
          </p>
          <div>
            <Button asChild>
              <a href="/onboarding/repositories">
                Connect Repositories
              </a>
            </Button>
          </div>
        </Card>
      )}
      
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Team retrospectives help you reflect on your team's performance, identify areas for improvement,
          and create actionable plans to enhance collaboration and productivity.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}