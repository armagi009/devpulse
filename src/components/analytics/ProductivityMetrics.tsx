/**
 * ProductivityMetrics Component
 * Displays productivity metrics for a user
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import type { ProductivityMetrics as ProductivityMetricsType } from '@/lib/analytics/productivity-metrics';
import CodeContributionHeatmap from './CodeContributionHeatmap';

interface ProductivityMetricsProps {
  userId?: string;
  repositoryId?: string;
  days?: number;
}

export default function ProductivityMetrics({
  userId,
  repositoryId,
  days = 30,
}: ProductivityMetricsProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ProductivityMetricsType | null>(null);
  const [workPatterns, setWorkPatterns] = useState<any | null>(null);
  const [trends, setTrends] = useState<any | null>(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (repositoryId) params.append('repositoryId', repositoryId);
        params.append('startDate', startDate.toISOString());
        params.append('endDate', endDate.toISOString());
        params.append('includeWorkPatterns', 'true');
        params.append('includeTrends', 'true');
        
        // Fetch metrics
        const response = await fetch(`/api/analytics/productivity?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch productivity metrics');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.message || 'Unknown error');
        }
        
        setMetrics(data.data.metrics);
        setWorkPatterns(data.data.workPatterns);
        setTrends(data.data.trends);
      } catch (err) {
        console.error('Error fetching productivity metrics:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [session, userId, repositoryId, days]);
  
  if (loading) {
    return <ProductivityMetricsSkeleton />;
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productivity Metrics</CardTitle>
          <CardDescription>Error loading metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productivity Metrics</CardTitle>
          <CardDescription>No metrics available</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No productivity data is available for the selected time period.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Productivity Overview</CardTitle>
          <CardDescription>
            {format(new Date(metrics.timeRange.start), 'MMM d, yyyy')} - {format(new Date(metrics.timeRange.end), 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Commits"
              value={metrics.commitCount}
              trend={trends?.metrics.current.commitCount - trends?.metrics.previous.commitCount}
            />
            <MetricCard
              title="Lines Changed"
              value={metrics.linesAdded + metrics.linesDeleted}
              trend={null}
              subtitle={`${metrics.linesAdded} added, ${metrics.linesDeleted} deleted`}
            />
            <MetricCard
              title="Pull Requests"
              value={metrics.prCount}
              trend={trends?.metrics.current.prCount - trends?.metrics.previous.prCount}
            />
            <MetricCard
              title="Code Quality"
              value={`${metrics.codeQualityScore}/100`}
              trend={trends?.metrics.current.codeQualityScore - trends?.metrics.previous.codeQualityScore}
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="activity">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="patterns">Work Patterns</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commit Activity</CardTitle>
                <CardDescription>Daily commit frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={metrics.commitFrequency.map(point => ({
                        date: format(new Date(point.date), 'MMM dd'),
                        commits: point.value
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="commits" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Code Contribution Heatmap</CardTitle>
                <CardDescription>Contribution activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CodeContributionHeatmap 
                  contributionData={metrics.commitFrequency}
                  startDate={new Date(metrics.timeRange.start)}
                  endDate={new Date(metrics.timeRange.end)}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>PR and Issue Metrics</CardTitle>
                <CardDescription>Pull request and issue activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Pull Request Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average PR Size</div>
                        <div className="text-lg font-medium">{metrics.avgPrSize} lines</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Time to Merge</div>
                        <div className="text-lg font-medium">
                          {metrics.avgTimeToMergePr !== null ? `${metrics.avgTimeToMergePr} hours` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total PRs</div>
                        <div className="text-lg font-medium">{metrics.prCount}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-4">Issue Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Issues</div>
                        <div className="text-lg font-medium">{metrics.issueCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Resolution Time</div>
                        <div className="text-lg font-medium">
                          {metrics.avgTimeToResolveIssue !== null ? `${metrics.avgTimeToResolveIssue} hours` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patterns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Hours Distribution</CardTitle>
                <CardDescription>When you're most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.workHoursDistribution.map(hour => ({
                        hour: `${hour.hour}:00`,
                        commits: hour.count
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="commits" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Weekday Distribution</CardTitle>
                <CardDescription>Activity by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.weekdayDistribution.map(day => ({
                        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.day],
                        commits: day.count
                      }))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="commits" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {workPatterns && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Work Pattern Analysis</CardTitle>
                <CardDescription>Your coding schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Average Start Time"
                    value={workPatterns.averageStartTime}
                    trend={null}
                  />
                  <MetricCard
                    title="Average End Time"
                    value={workPatterns.averageEndTime}
                    trend={null}
                  />
                  <MetricCard
                    title="Weekend Work"
                    value={`${workPatterns.weekendWorkPercentage}%`}
                    trend={null}
                  />
                  <MetricCard
                    title="Consistency Score"
                    value={`${workPatterns.consistencyScore}/100`}
                    trend={null}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Top languages used</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.topLanguages.map(lang => ({
                        name: lang.language,
                        value: lang.percentage * 100
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {metrics.topLanguages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle>Productivity Trend</CardTitle>
                <CardDescription>
                  Your productivity is {trends.trend}
                  {trends.percentageChange > 0 ? 
                    ` (+${trends.percentageChange.toFixed(1)}%)` : 
                    trends.percentageChange < 0 ? 
                    ` (${trends.percentageChange.toFixed(1)}%)` : 
                    ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Previous Period</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <MetricCard
                        title="Commits"
                        value={trends.metrics.previous.commitCount}
                        trend={null}
                        size="sm"
                      />
                      <MetricCard
                        title="PRs"
                        value={trends.metrics.previous.prCount}
                        trend={null}
                        size="sm"
                      />
                      <MetricCard
                        title="Issues"
                        value={trends.metrics.previous.issueCount}
                        trend={null}
                        size="sm"
                      />
                      <MetricCard
                        title="Code Quality"
                        value={`${trends.metrics.previous.codeQualityScore}/100`}
                        trend={null}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Period</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <MetricCard
                        title="Commits"
                        value={trends.metrics.current.commitCount}
                        trend={null}
                        size="sm"
                      />
                      <MetricCard
                        title="PRs"
                        value={trends.metrics.current.prCount}
                        trend={null}
                        size="sm"
                      />
                      <MetricCard
                        title="Issues"
                        value={trends.metrics.current.issueCount}
                        trend={null}
                        size="sm"
                      />
                      <MetricCard
                        title="Code Quality"
                        value={`${trends.metrics.current.codeQualityScore}/100`}
                        trend={null}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  trend: number | null;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

function MetricCard({ title, value, trend, subtitle, size = 'md' }: MetricCardProps) {
  return (
    <div className={`bg-card rounded-lg p-${size === 'sm' ? '3' : '4'} border`}>
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={`font-bold ${size === 'sm' ? 'text-xl' : 'text-2xl'} mt-1 flex items-center`}>
        {value}
        {trend !== null && (
          <span className={`ml-2 text-sm ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
            {Math.abs(trend)}
          </span>
        )}
      </div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}

// Skeleton loading state
function ProductivityMetricsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle><span className="h-6 w-48 animate-pulse rounded-md bg-muted inline-block" /></CardTitle>
          <CardDescription><span className="h-4 w-32 animate-pulse rounded-md bg-muted inline-block" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 border">
                <div className="h-4 w-24 mb-2 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle><span className="h-6 w-36 animate-pulse rounded-md bg-muted inline-block" /></CardTitle>
          <CardDescription><span className="h-4 w-48 animate-pulse rounded-md bg-muted inline-block" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}