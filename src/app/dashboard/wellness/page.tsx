'use client';

/**
 * Developer Wellness Dashboard Page
 * Full-screen immersive wellness monitoring experience for developers
 * Adapted from original prototype to integrate with DevPulse infrastructure
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/types/roles';
import { useWellnessData } from '@/lib/hooks/useWellnessData';
import Header from '@/components/layout/Header';
import DashboardCard from '@/components/ui/DashboardCard';
import { ModernCard, ModernButton, ModernMetricCard } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Brain, 
  Users, 
  TrendingUp, 
  Clock, 
  GitCommit, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Zap,
  Heart,
  Target,
  BarChart3,
  GitPullRequest,
  Bug,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';

interface WellnessData {
  riskScore: number;
  confidence: number;
  keyFactors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
  historicalTrend: Array<{
    date: Date;
    value: number;
  }>;
}

interface DeveloperProfile {
  name: string;
  avatar?: string;
  currentStreak: number;
  wellnessScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  lastCommit: string;
}

export default function WellnessDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Use the new wellness data hook
  const { data: dashboardData, isLoading: dataLoading, error: dataError, refresh } = useWellnessData({
    repositoryId: 'default',
    days: 30,
    enableCache: true
  });

  // Check permissions and handle loading
  useEffect(() => {
    if (status === 'authenticated' && !hasPermission(PERMISSIONS.VIEW_PERSONAL_METRICS)) {
      router.push('/unauthorized');
      return;
    }
    
    if (status === 'authenticated') {
      setIsLoading(dataLoading);
      if (dashboardData) {
        setWellnessData(dashboardData.wellnessData);
      }
    }
  }, [status, hasPermission, router, dataLoading, dashboardData]);

  // Mock developer profile data (in real implementation, this would come from API)
  const developerProfile: DeveloperProfile = {
    name: session?.user?.name || 'Developer',
    avatar: session?.user?.image || undefined,
    currentStreak: 12,
    wellnessScore: wellnessData ? Math.max(0, 100 - wellnessData.riskScore) : 78,
    riskLevel: wellnessData ? 
      (wellnessData.riskScore < 30 ? 'low' : wellnessData.riskScore < 70 ? 'moderate' : 'high') : 
      'moderate',
    lastCommit: '23 minutes ago'
  };

  // AI Insights based on real data
  const aiInsights = {
    selfReassurance: {
      message: wellnessData?.recommendations[0] || "You've successfully resolved similar complex issues in the past. Your patterns show consistent problem-solving ability.",
      confidence: wellnessData?.confidence ? Math.round(wellnessData.confidence * 100) : 89,
      historicalData: wellnessData?.historicalTrend?.map((item, index) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index] || `Week ${index + 1}`,
        resolved: Math.round(item.value / 3) // Convert to resolved issues
      })) || []
    },
    peerValidation: {
      message: "Your team members are experiencing similar patterns this sprint. This is normal during high-intensity development cycles.",
      teamMetrics: {
        avgReviewTime: "2.4 hours",
        yourReviewTime: "2.1 hours", 
        teamStress: "moderate",
        similarExperience: 67
      }
    },
    socialProjection: {
      message: "Your code contributions are creating measurable stability improvements and reducing technical debt.",
      impact: {
        bugReduction: 15,
        testCoverage: "+12%",
        teamVelocity: "+8%",
        codeQuality: 92
      }
    }
  };

  const realtimeActivity = [
    { time: "2:34 PM", action: "Merged PR #247", type: "success", impact: "high" },
    { time: "1:52 PM", action: "Code review completed", type: "neutral", impact: "medium" },
    { time: "12:15 PM", action: "Late night commit detected", type: "warning", impact: "high" },
    { time: "11:30 AM", action: "Pair programming session", type: "positive", impact: "medium" },
    { time: "10:45 AM", action: "Issue #189 resolved", type: "success", impact: "high" }
  ];

  const wellnessMetrics = {
    workLifeBalance: 72,
    codeQuality: 88,
    collaborationHealth: 81,
    stressLevel: wellnessData?.riskScore || 34,
    productivityTrend: "stable"
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={session?.user} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header user={session?.user} />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Developer Profile Card */}
        <ModernCard className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 mb-8" gradient>
          <div className="flex items-center space-x-4">
            {developerProfile.avatar ? (
              <img
                src={developerProfile.avatar}
                alt="Developer"
                className="w-16 h-16 rounded-full border-4 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-white/20 bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {developerProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Welcome back, {developerProfile.name}</h2>
              <p className="text-blue-100">
                Wellness Score: {developerProfile.wellnessScore}/100 • 
                Last commit: {developerProfile.lastCommit}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Zap size={16} />
                <span className="font-semibold">{developerProfile.currentStreak} day streak</span>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                developerProfile.riskLevel === 'low' ? 'bg-success-100 text-success-900' :
                developerProfile.riskLevel === 'moderate' ? 'bg-warning-100 text-warning-900' :
                'bg-error-100 text-error-900'
              )}>
                {developerProfile.riskLevel} risk
              </span>
            </div>
          </div>
        </ModernCard>

        {/* Navigation Tabs */}
        <ModernCard className="flex space-x-2 mb-8 p-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={Activity}
            active={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="insights"
            label="AI Insights"
            icon={Brain}
            active={activeTab === 'insights'}
            onClick={setActiveTab}
          />
          <TabButton
            id="activity"
            label="Live Activity"
            icon={GitCommit}
            active={activeTab === 'activity'}
            onClick={setActiveTab}
          />
          <TabButton
            id="wellness"
            label="Wellness"
            icon={Heart}
            active={activeTab === 'wellness'}
            onClick={setActiveTab}
          />
        </ModernCard>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab wellnessMetrics={wellnessMetrics} />
        )}

        {activeTab === 'insights' && (
          <InsightsTab aiInsights={aiInsights} />
        )}

        {activeTab === 'activity' && (
          <ActivityTab realtimeActivity={realtimeActivity} />
        )}

        {activeTab === 'wellness' && (
          <WellnessTab wellnessMetrics={wellnessMetrics} wellnessData={wellnessData} />
        )}
      </div>
    </div>
  );
}

// Tab Button Component
const TabButton = ({ id, label, icon: Icon, active, onClick }: {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: (id: string) => void;
}) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium",
      active 
        ? 'bg-primary text-primary-foreground shadow-lg' 
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }: {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: string;
}) => {
  const colorMap = {
    blue: { bg: 'bg-primary/10', text: 'text-primary' },
    green: { bg: 'bg-success/10', text: 'text-success' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    red: { bg: 'bg-error/10', text: 'text-error' }
  };

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  return (
    <ModernCard className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className={cn(
              "text-sm mt-1 flex items-center",
              change.startsWith('+') ? 'text-success' : 'text-error'
            )}>
              <TrendingUp size={14} className="mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colors.bg)}>
          <Icon size={24} className={colors.text} />
        </div>
      </div>
    </ModernCard>
  );
};

// Wellness Gauge Component
const WellnessGauge = ({ label, value, color = "hsl(var(--primary))" }: {
  label: string;
  value: number;
  color?: string;
}) => (
  <div className="text-center">
    <div className="relative w-20 h-20 mx-auto mb-2">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${value}, 100`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-foreground">{value}%</span>
      </div>
    </div>
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
  </div>
);

// AI Insight Card Component
const AIInsightCard = ({ title, message, data, icon: Icon, layer }: {
  title: string;
  message: string;
  data?: Record<string, any>;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  layer: number;
}) => (
  <ModernCard className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 border border-purple-200 dark:border-purple-800 mb-4">
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
        <Icon size={20} className="text-purple-600 dark:text-purple-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
            Layer {layer}
          </span>
        </div>
        <p className="text-muted-foreground mb-3 leading-relaxed">{message}</p>
        {data && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {Object.entries(data).map(([key, value]) => (
              <ModernCard key={key} className="p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1')}
                </p>
                <p className="text-lg font-semibold text-foreground">{value}</p>
              </ModernCard>
            ))}
          </div>
        )}
      </div>
    </div>
  </ModernCard>
);

// Activity Item Component
const ActivityItem = ({ time, action, type, impact }: {
  time: string;
  action: string;
  type: 'success' | 'warning' | 'positive' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}) => {
  const typeColors = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    positive: 'text-primary bg-primary/10',
    neutral: 'text-muted-foreground bg-muted'
  };

  const typeIcons = {
    success: CheckCircle,
    warning: AlertTriangle,
    positive: Heart,
    neutral: Activity
  };

  const Icon = typeIcons[type];

  return (
    <div className="flex items-center space-x-4 p-3 hover:bg-accent rounded-lg transition-colors">
      <div className={cn("p-2 rounded-lg", typeColors[type])}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{action}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <span className={cn(
        "px-2 py-1 text-xs rounded-full",
        impact === 'high' ? 'bg-error/10 text-error' :
        impact === 'medium' ? 'bg-warning/10 text-warning' :
        'bg-success/10 text-success'
      )}>
        {impact}
      </span>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ wellnessMetrics }: { wellnessMetrics: any }) => (
  <div className="space-y-8">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Commits Today"
        value="8"
        change="+2 from yesterday"
        icon={GitCommit}
        color="blue"
      />
      <MetricCard
        title="Code Reviews"
        value="3"
        change="+1 pending"
        icon={GitPullRequest}
        color="green"
      />
      <MetricCard
        title="Issues Resolved"
        value="12"
        change="+15% this week"
        icon={CheckCircle}
        color="purple"
      />
      <MetricCard
        title="Bug Reports"
        value="2"
        change="-50% this month"
        icon={Bug}
        color="red"
      />
    </div>

    {/* Wellness Overview */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <ModernCard className="lg:col-span-2 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Wellness Trends</h3>
        <div className="grid grid-cols-4 gap-6">
          <WellnessGauge label="Work-Life Balance" value={wellnessMetrics.workLifeBalance} color="hsl(var(--primary))" />
          <WellnessGauge label="Code Quality" value={wellnessMetrics.codeQuality} color="hsl(var(--success))" />
          <WellnessGauge label="Collaboration" value={wellnessMetrics.collaborationHealth} color="#8b5cf6" />
          <WellnessGauge label="Stress Level" value={100 - wellnessMetrics.stressLevel} color="hsl(var(--warning))" />
        </div>
      </ModernCard>
      
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
            <Coffee size={18} className="text-warning" />
            <span className="text-sm font-medium text-foreground">Schedule break reminder</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
            <Users size={18} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Request pair programming</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-accent rounded-lg transition-colors">
            <Calendar size={18} className="text-success" />
            <span className="text-sm font-medium text-foreground">Block focus time</span>
          </button>
        </div>
      </ModernCard>
    </div>
  </div>
);

// Insights Tab Component
const InsightsTab = ({ aiInsights }: { aiInsights: any }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Burnout Prevention Insights</h2>
      <p className="text-gray-600">Three-layer reassurance system powered by real-time GitHub analytics</p>
    </div>

    <AIInsightCard
      title="Self-Reassurance: You've Got This"
      message={aiInsights.selfReassurance.message}
      data={{
        'Confidence Level': `${aiInsights.selfReassurance.confidence}%`,
        'Success Pattern': 'Strong',
        'Historical Trend': 'Positive',
        'Resolution Rate': '94%'
      }}
      icon={Target}
      layer={1}
    />

    <AIInsightCard
      title="Peer Validation: You're Not Alone"
      message={aiInsights.peerValidation.message}
      data={aiInsights.peerValidation.teamMetrics}
      icon={Users}
      layer={2}
    />

    <AIInsightCard
      title="Social Impact: Your Contributions Matter"
      message={aiInsights.socialProjection.message}
      data={aiInsights.socialProjection.impact}
      icon={TrendingUp}
      layer={3}
    />

    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-3">
        <Brain size={20} className="text-blue-600" />
        <h3 className="font-semibold text-blue-900">AI Recommendation</h3>
      </div>
      <p className="text-blue-800 mb-4">
        Based on your current patterns, consider taking a 15-minute walk after your next commit. 
        Your productivity typically increases by 23% after short breaks during afternoon sessions.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Schedule Break
      </button>
    </div>
  </div>
);

// Activity Tab Component
const ActivityTab = ({ realtimeActivity }: { realtimeActivity: any[] }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Real-Time Activity Feed</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>
      <div className="space-y-2">
        {realtimeActivity.map((activity, index) => (
          <ActivityItem key={index} {...activity} />
        ))}
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Pattern</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun size={16} className="text-yellow-500" />
              <span className="text-sm">Morning (6-12)</span>
            </div>
            <span className="text-sm font-medium text-green-600">High Focus</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sun size={16} className="text-orange-500" />
              <span className="text-sm">Afternoon (12-18)</span>
            </div>
            <span className="text-sm font-medium text-yellow-600">Moderate</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon size={16} className="text-blue-500" />
              <span className="text-sm">Evening (18-24)</span>
            </div>
            <span className="text-sm font-medium text-red-600">Overtime Alert</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle size={18} className="text-amber-600" />
          <h3 className="font-semibold text-amber-900">Burnout Alert</h3>
        </div>
        <p className="text-amber-800 text-sm mb-4">
          Late-night coding detected. Consider wrapping up to maintain tomorrow's productivity.
        </p>
        <button className="bg-amber-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors">
          Set Reminder
        </button>
      </div>
    </div>
  </div>
);

// Wellness Tab Component
const WellnessTab = ({ wellnessMetrics, wellnessData }: { wellnessMetrics: any; wellnessData: any }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Wellness Score Breakdown</h3>
      <div className="space-y-6">
        {Object.entries(wellnessMetrics).filter(([key]) => key !== 'productivityTrend').map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-sm font-bold text-gray-900">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  (value as number) >= 80 ? 'bg-green-500' :
                  (value as number) >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <CheckCircle size={18} className="text-green-600" />
          <h3 className="font-semibold text-green-900">Healthy Patterns</h3>
        </div>
        <ul className="text-green-800 text-sm space-y-2">
          <li>• Consistent morning productivity</li>
          <li>• Regular code review participation</li>
          <li>• Good test coverage maintenance</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle size={18} className="text-yellow-600" />
          <h3 className="font-semibold text-yellow-900">Areas for Improvement</h3>
        </div>
        <ul className="text-yellow-800 text-sm space-y-2">
          {wellnessData?.recommendations?.slice(0, 3).map((rec: string, index: number) => (
            <li key={index}>• {rec}</li>
          )) || (
            <>
              <li>• Reduce late-night coding sessions</li>
              <li>• Take more regular breaks</li>
              <li>• Increase pair programming frequency</li>
            </>
          )}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Heart size={18} className="text-blue-600" />
          <h3 className="font-semibold text-blue-900">Wellness Tips</h3>
        </div>
        <p className="text-blue-800 text-sm">
          Your most productive hours are 9-11 AM. Consider scheduling complex tasks during this window 
          and saving routine work for afternoon sessions.
        </p>
      </div>
    </div>
  </div>
);