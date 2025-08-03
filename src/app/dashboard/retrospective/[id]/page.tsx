/**
 * Retrospective Detail Page
 * Displays a specific retrospective with insights and action items
 */

import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db/prisma';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import ActionItemsTracker from '@/components/retrospective/ActionItemsTracker';
import TeamInsightsPanel from '@/components/retrospective/TeamInsightsPanel';
import TrendComparisonChart from '@/components/retrospective/TrendComparisonChart';

interface RetrospectiveDetailPageProps {
  params: {
    id: string;
  };
}

export default async function RetrospectiveDetailPage({ params }: RetrospectiveDetailPageProps) {
  // Get session
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return notFound();
  }
  
  // Get retrospective
  const retrospective = await prisma.retrospective.findUnique({
    where: {
      id: params.id,
    },
  });
  
  if (!retrospective) {
    return notFound();
  }
  
  // Get repository info if needed
  let repository = null;
  try {
    repository = await prisma.repository.findUnique({
      where: {
        id: retrospective.repositoryId,
      },
    });
  } catch (error) {
    console.error('Error fetching repository:', error);
  }
  
  // Get previous retrospective for comparison
  const previousRetrospective = await prisma.retrospective.findFirst({
    where: {
      repositoryId: retrospective.repositoryId,
      createdAt: {
        lt: retrospective.createdAt,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  // Get team metrics for the period
  const teamMetrics = await prisma.teamInsight.findMany({
    where: {
      repositoryId: retrospective.repositoryId,
      date: {
        gte: retrospective.startDate,
        lte: retrospective.endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
  
  // Calculate trend direction
  const getTrendDirection = (current: number, previous: number | null) => {
    if (previous === null) return 'stable';
    const diff = current - previous;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  };
  
  const healthScoreTrend = getTrendDirection(
    Number(retrospective.teamHealthScore),
    previousRetrospective ? Number(previousRetrospective.teamHealthScore) : null
  );
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/dashboard/retrospective" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Retrospectives
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Retrospective</h1>
          <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {format(new Date(retrospective.startDate), 'MMM d, yyyy')} - {format(new Date(retrospective.endDate), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Team Health</div>
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">{retrospective.teamHealthScore}/100</span>
              {healthScoreTrend === 'up' && (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
              {healthScoreTrend === 'down' && (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* What Went Well */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                What Went Well
              </CardTitle>
              <CardDescription>Positive aspects from this period</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retrospective.positives.map((positive, index) => (
                  <li key={index} className="flex">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{positive}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <XCircle className="h-5 w-5 text-amber-500 mr-2" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>Aspects that could be improved</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retrospective.improvements.map((improvement, index) => (
                  <li key={index} className="flex">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
                Action Items
              </CardTitle>
              <CardDescription>Tasks to address the identified issues</CardDescription>
            </CardHeader>
            <CardContent>
              <ActionItemsTracker 
                retrospectiveId={retrospective.id}
                initialActionItems={retrospective.actionItems}
              />
            </CardContent>
          </Card>
          
          {/* Team Insights */}
          <TeamInsightsPanel 
            repositoryId={retrospective.repositoryId}
            startDate={retrospective.startDate}
            endDate={retrospective.endDate}
            observations={retrospective.observations}
          />
        </div>
        
        <div className="space-y-6">
          {/* Team Health Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Team Health Trend</CardTitle>
              <CardDescription>
                Health score over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendComparisonChart 
                repositoryId={retrospective.repositoryId}
                currentPeriod={{
                  start: retrospective.startDate,
                  end: retrospective.endDate,
                }}
                previousPeriod={
                  previousRetrospective
                    ? {
                        start: previousRetrospective.startDate,
                        end: previousRetrospective.endDate,
                      }
                    : undefined
                }
                teamMetrics={teamMetrics}
              />
            </CardContent>
          </Card>
          
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggestions for the next sprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {retrospective.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Repository Info */}
          <Card>
            <CardHeader>
              <CardTitle>Repository</CardTitle>
            </CardHeader>
            <CardContent>
              {repository ? (
                <>
                  <div className="text-lg font-medium">
                    {repository.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {repository.fullName}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Repository ID: {retrospective.repositoryId}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}