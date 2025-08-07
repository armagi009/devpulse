'use client';

/**
 * Manager Capacity Dashboard Page
 * Full-screen immersive team capacity intelligence experience for managers/team-leads
 * Adapted from original prototype to integrate with DevPulse infrastructure
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/types/roles';
import { useCapacityData } from '@/lib/hooks/useCapacityData';
import Header from '@/components/layout/Header';
import DashboardCard from '@/components/ui/DashboardCard';
import { ModernCard, ModernButton, ModernMetricCard } from '@/components/ui/modern-card';
import { cn } from '@/lib/utils';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Target,
  Zap,
  Shield,
  MessageSquare,
  GitCommit,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Settings,
  Bell,
  Coffee,
  UserX,
  UserCheck,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  capacity: number;
  burnoutRisk: 'low' | 'moderate' | 'high';
  trend: 'improving' | 'stable' | 'declining';
  velocity: number;
  wellnessFactor: number;
  collaborationHealth: number;
  stressMultiplier: number;
  keyMetrics: {
    lateNightCommits: number;
    weekendActivity: number;
    reviewResponseTime: string;
    codeQuality: number;
    teamInteractions: number;
    mentoringHours: number;
  };
  alerts: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    time: string;
  }>;
  recommendations: string[];
}

interface TeamOverview {
  averageCapacity: number;
  highRiskCount: number;
  optimalCount: number;
  needsSupportCount: number;
  totalVelocity: number;
  teamMorale: number;
  burnoutPrevented: number;
  interventionsThisMonth: number;
}

interface TeamAnalytics {
  teamId: string;
  metrics: {
    velocity: {
      average: number;
      trend: string;
      percentageChange: number;
    };
    collaboration: {
      score: number;
      bottlenecks: Array<{
        memberId: string;
        reason: string;
      }>;
    };
  };
}

export default function CapacityDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [selectedDeveloper, setSelectedDeveloper] = useState<TeamMember | null>(null);
  const [timeframe, setTimeframe] = useState('week');
  const [viewMode, setViewMode] = useState('capacity');
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [teamOverview, setTeamOverview] = useState<TeamOverview | null>(null);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the new capacity data hook
  const { data: dashboardData, isLoading: dataLoading, error: dataError, refresh } = useCapacityData({
    teamId: 'default',
    enableCache: true
  });

  // Check permissions and handle loading
  useEffect(() => {
    if (status === 'authenticated' && !hasPermission(PERMISSIONS.VIEW_TEAM_METRICS) && !hasPermission(PERMISSIONS.VIEW_BURNOUT_TEAM)) {
      router.push('/unauthorized');
      return;
    }
    
    if (status === 'authenticated') {
      setIsLoading(dataLoading);
      if (dashboardData) {
        setTeamData(dashboardData.teamMembers);
        setTeamOverview(dashboardData.teamOverview);
        setTeamAnalytics(dashboardData.teamAnalytics);
      }
    }
  }, [status, hasPermission, router, dataLoading, dashboardData]);

  // Generate mock team data based on real API responses
  const generateMockTeamData = (teamAnalytics: any, burnoutData: any) => {
    const members: TeamMember[] = [
      {
        id: '1',
        name: session?.user?.name || 'Sarah Chen',
        avatar: session?.user?.image,
        role: 'Senior Frontend',
        capacity: 92,
        burnoutRisk: burnoutData.riskScore > 70 ? 'high' : burnoutData.riskScore > 40 ? 'moderate' : 'low',
        trend: 'declining',
        velocity: 85,
        wellnessFactor: 0.7,
        collaborationHealth: 88,
        stressMultiplier: 1.3,
        keyMetrics: {
          lateNightCommits: 8,
          weekendActivity: 12,
          reviewResponseTime: '4.2h',
          codeQuality: 78,
          teamInteractions: 23,
          mentoringHours: 2.5
        },
        alerts: [
          { type: 'critical', message: '3 consecutive late-night sessions', time: '2h ago' },
          { type: 'warning', message: 'Code quality declining (-15%)', time: '1d ago' }
        ],
        recommendations: burnoutData.recommendations?.slice(0, 3) || [
          'Redistribute 2-3 tasks from backlog',
          'Schedule wellness check-in',
          'Pair with junior dev to reduce load'
        ]
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        role: 'Full Stack',
        capacity: 78,
        burnoutRisk: 'moderate',
        trend: 'stable',
        velocity: 92,
        wellnessFactor: 0.85,
        collaborationHealth: 95,
        stressMultiplier: 1.1,
        keyMetrics: {
          lateNightCommits: 2,
          weekendActivity: 4,
          reviewResponseTime: '1.8h',
          codeQuality: 91,
          teamInteractions: 45,
          mentoringHours: 6.5
        },
        alerts: [
          { type: 'info', message: 'High mentoring activity - great impact!', time: '6h ago' }
        ],
        recommendations: [
          'Consider for tech lead opportunities',
          'Maintain current healthy patterns'
        ]
      },
      {
        id: '3',
        name: 'Priya Patel',
        role: 'Backend Lead',
        capacity: 65,
        burnoutRisk: 'low',
        trend: 'improving',
        velocity: 88,
        wellnessFactor: 0.95,
        collaborationHealth: 82,
        stressMultiplier: 0.9,
        keyMetrics: {
          lateNightCommits: 1,
          weekendActivity: 0,
          reviewResponseTime: '2.1h',
          codeQuality: 94,
          teamInteractions: 38,
          mentoringHours: 4.0
        },
        alerts: [],
        recommendations: [
          'Could take on additional responsibilities',
          'Excellent work-life balance model'
        ]
      },
      {
        id: '4',
        name: 'Alex Kim',
        role: 'Junior Developer',
        capacity: 88,
        burnoutRisk: 'moderate',
        trend: 'stable',
        velocity: 68,
        wellnessFactor: 0.75,
        collaborationHealth: 72,
        stressMultiplier: 1.2,
        keyMetrics: {
          lateNightCommits: 5,
          weekendActivity: 8,
          reviewResponseTime: '6.1h',
          codeQuality: 83,
          teamInteractions: 18,
          mentoringHours: 0.5
        },
        alerts: [
          { type: 'warning', message: 'Learning curve stress detected', time: '4h ago' }
        ],
        recommendations: [
          'Increase pairing sessions',
          'Assign more senior mentor',
          'Reduce complex task assignment'
        ]
      }
    ];

    const overview: TeamOverview = {
      averageCapacity: Math.round(members.reduce((sum, m) => sum + m.capacity, 0) / members.length),
      highRiskCount: members.filter(m => m.burnoutRisk === 'high').length,
      optimalCount: members.filter(m => m.capacity >= 60 && m.capacity <= 80).length,
      needsSupportCount: members.filter(m => m.burnoutRisk === 'high' || m.capacity > 90).length,
      totalVelocity: members.reduce((sum, m) => sum + m.velocity, 0),
      teamMorale: 76,
      burnoutPrevented: 3,
      interventionsThisMonth: 7
    };

    return { members, overview };
  };

  const capacityDistribution = teamData.length > 0 ? [
    { range: '0-60%', count: teamData.filter(m => m.capacity < 60).length, color: 'bg-green-500', label: 'Underutilized' },
    { range: '60-80%', count: teamData.filter(m => m.capacity >= 60 && m.capacity < 80).length, color: 'bg-blue-500', label: 'Optimal' },
    { range: '80-90%', count: teamData.filter(m => m.capacity >= 80 && m.capacity < 90).length, color: 'bg-yellow-500', label: 'High' },
    { range: '90-100%', count: teamData.filter(m => m.capacity >= 90).length, color: 'bg-red-500', label: 'Critical' }
  ] : [];

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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Team Capacity Intelligence</h1>
                <p className="text-sm text-muted-foreground">Monitor team wellness and optimize capacity distribution</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <ModernButton variant="primary" size="sm">
              <Settings size={16} className="mr-2" />
              Configure Alerts
            </ModernButton>
          </div>
        </div>

        {/* Executive Summary */}
        {teamOverview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Team Avg Capacity"
              value={`${teamOverview.averageCapacity}%`}
              subtitle="Optimal range: 70-85%"
              icon={Target}
              color="purple"
            />
            <MetricCard
              title="High Risk Developers"
              value={teamOverview.highRiskCount}
              subtitle="Immediate attention needed"
              icon={AlertTriangle}
              color="red"
            />
            <MetricCard
              title="Burnouts Prevented"
              value={teamOverview.burnoutPrevented}
              subtitle="This month"
              icon={Shield}
              color="green"
            />
            <MetricCard
              title="Team Velocity"
              value={teamOverview.totalVelocity}
              subtitle="Story points/sprint"
              icon={Zap}
              color="blue"
            />
          </div>
        )}

        {/* Capacity Distribution */}
        <ModernCard className="p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-6">Team Capacity Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {capacityDistribution.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`h-32 ${item.color} rounded-lg mb-3 flex items-end justify-center pb-2`}>
                  <span className="text-white font-bold text-xl">{item.count}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{item.range}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </ModernCard>

        {/* Team Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('capacity')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  viewMode === 'capacity' ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                Capacity View
              </button>
              <button
                onClick={() => setViewMode('wellness')}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  viewMode === 'wellness' ? 'bg-purple-600 text-white' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                Wellness View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamData.map((developer) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                onClick={setSelectedDeveloper}
              />
            ))}
          </div>
        </div>

        {/* Manager Action Center and AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ManagerActionCenter teamData={teamData} />
          <CapacityManagementTools />
        </div>

        {/* AI Insights for Managers */}
        <AIManagerInsights teamAnalytics={teamAnalytics} />
      </div>

      {/* Developer Detail Modal */}
      {selectedDeveloper && (
        <DeveloperDetailModal
          developer={selectedDeveloper}
          onClose={() => setSelectedDeveloper(null)}
        />
      )}
    </div>
  );
}

// Utility functions
const getRiskColor = (risk: 'low' | 'moderate' | 'high') => {
  switch(risk) {
    case 'low': return 'text-success bg-success/10';
    case 'moderate': return 'text-warning bg-warning/10'; 
    case 'high': return 'text-error bg-error/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
  switch(trend) {
    case 'improving': return <ArrowUp size={16} className="text-success" />;
    case 'declining': return <ArrowDown size={16} className="text-error" />;
    case 'stable': return <Minus size={16} className="text-muted-foreground" />;
    default: return <Minus size={16} className="text-muted-foreground" />;
  }
};

// Capacity Gauge Component
const CapacityGauge = ({ value, size = "large" }: { value: number; size?: "large" | "small" }) => {
  const radius = size === "large" ? 40 : 30;
  const strokeWidth = size === "large" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 90) return "hsl(var(--error))";
    if (value >= 80) return "hsl(var(--warning))";
    if (value >= 60) return "hsl(var(--primary))";
    return "hsl(var(--success))";
  };

  return (
    <div className={`relative ${size === "large" ? "w-24 h-24" : "w-16 h-16"}`}>
      <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${size === "large" ? "text-lg" : "text-sm"} text-foreground`}>
          {value}%
        </span>
      </div>
    </div>
  );
};

// Developer Card Component
const DeveloperCard = ({ developer, onClick }: {
  developer: TeamMember;
  onClick: (developer: TeamMember) => void;
}) => (
  <ModernCard 
    className="p-6 hover:shadow-md transition-all cursor-pointer"
    onClick={() => onClick(developer)}
  >
    <div className="flex items-center space-x-4 mb-4">
      {developer.avatar ? (
        <img
          src={developer.avatar}
          alt={developer.name}
          className="w-12 h-12 rounded-full"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <span className="text-lg font-semibold text-muted-foreground">
            {developer.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{developer.name}</h3>
        <p className="text-sm text-muted-foreground">{developer.role}</p>
      </div>
      <div className="flex items-center space-x-2">
        {getTrendIcon(developer.trend)}
        <CapacityGauge value={developer.capacity} size="small" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Velocity</p>
        <p className="text-sm font-semibold text-foreground">{developer.velocity}/100</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Wellness</p>
        <p className="text-sm font-semibold text-foreground">{Math.round(developer.wellnessFactor * 100)}%</p>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getRiskColor(developer.burnoutRisk))}>
        {developer.burnoutRisk} risk
      </span>
      {developer.alerts.length > 0 && (
        <div className="flex items-center space-x-1">
          <Bell size={14} className="text-warning" />
          <span className="text-xs text-warning">{developer.alerts.length}</span>
        </div>
      )}
    </div>
  </ModernCard>
);

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: string;
}) => {
  const colorMap = {
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    red: { bg: 'bg-error/10', text: 'text-error' },
    green: { bg: 'bg-success/10', text: 'text-success' },
    blue: { bg: 'bg-primary/10', text: 'text-primary' }
  };

  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  return (
    <ModernCard className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-lg", colors.bg)}>
          <Icon size={24} className={colors.text} />
        </div>
      </div>
    </ModernCard>
  );
};

// Manager Action Center Component
const ManagerActionCenter = ({ teamData }: { teamData: TeamMember[] }) => {
  const highRiskMembers = teamData.filter(m => m.burnoutRisk === 'high');
  const moderateRiskMembers = teamData.filter(m => m.burnoutRisk === 'moderate');
  const highPerformers = teamData.filter(m => m.wellnessFactor > 0.8 && m.velocity > 85);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Immediate Actions Required</h3>
      <div className="space-y-4">
        {highRiskMembers.map((member) => (
          <div key={member.id} className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={20} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">{member.name} - High Burnout Risk</p>
              <p className="text-sm text-red-700 mt-1">
                {member.alerts.find(a => a.type === 'critical')?.message || 'Multiple stress indicators detected'}
              </p>
              <button className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                Schedule 1:1
              </button>
            </div>
          </div>
        ))}

        {moderateRiskMembers.slice(0, 1).map((member) => (
          <div key={member.id} className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock size={20} className="text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">{member.name} - Moderate Risk</p>
              <p className="text-sm text-yellow-700 mt-1">
                {member.alerts.find(a => a.type === 'warning')?.message || 'Early warning signs detected'}
              </p>
              <button className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
                Monitor Closely
              </button>
            </div>
          </div>
        ))}

        {highPerformers.slice(0, 1).map((member) => (
          <div key={member.id} className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={20} className="text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">{member.name} - Leadership Potential</p>
              <p className="text-sm text-green-700 mt-1">
                High mentoring activity, excellent capacity management
              </p>
              <button className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                Discuss Growth
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Capacity Management Tools Component
const CapacityManagementTools = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Management Tools</h3>
    <div className="space-y-4">
      <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
        <Calendar size={20} className="text-blue-600" />
        <div>
          <p className="font-medium text-gray-900">Redistribute Sprint Tasks</p>
          <p className="text-sm text-gray-500">Automatically suggest task reallocation</p>
        </div>
      </button>

      <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
        <MessageSquare size={20} className="text-green-600" />
        <div>
          <p className="font-medium text-gray-900">Schedule Team Check-ins</p>
          <p className="text-sm text-gray-500">Proactive wellness conversations</p>
        </div>
      </button>

      <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
        <Coffee size={20} className="text-amber-600" />
        <div>
          <p className="font-medium text-gray-900">Suggest Focus Time</p>
          <p className="text-sm text-gray-500">Block calendar for deep work</p>
        </div>
      </button>

      <button className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
        <Users size={20} className="text-purple-600" />
        <div>
          <p className="font-medium text-gray-900">Pair Programming Matrix</p>
          <p className="text-sm text-gray-500">Optimize knowledge sharing</p>
        </div>
      </button>
    </div>
  </div>
);

// AI Manager Insights Component
const AIManagerInsights = ({ teamAnalytics }: { teamAnalytics: TeamAnalytics | null }) => (
  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
    <div className="flex items-center space-x-3 mb-4">
      <Brain size={24} className="text-purple-600" />
      <h3 className="text-lg font-semibold text-purple-900">AI Management Insights</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-purple-900 mb-2">Capacity Optimization</h4>
        <p className="text-purple-800 text-sm mb-3">
          Your team's current capacity distribution suggests redistributing 2-3 tasks from high-capacity members 
          to optimize both productivity and wellness outcomes.
        </p>
        <button className="text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors">
          View Suggestions
        </button>
      </div>
      <div>
        <h4 className="font-medium text-purple-900 mb-2">Team Dynamics</h4>
        <p className="text-purple-800 text-sm mb-3">
          {teamAnalytics?.metrics?.collaboration?.score ? 
            `Team collaboration score is ${Math.round(teamAnalytics.metrics.collaboration.score * 100)}%. Consider formalizing mentoring relationships to boost team velocity.` :
            'High mentoring activity is positively impacting team velocity. Consider formalizing mentoring roles.'
          }
        </p>
        <button className="text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors">
          Create Plan
        </button>
      </div>
    </div>
  </div>
);

// Developer Detail Modal Component
const DeveloperDetailModal = ({ developer, onClose }: {
  developer: TeamMember;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {developer.avatar ? (
              <img
                src={developer.avatar}
                alt={developer.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-600">
                  {developer.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{developer.name}</h2>
              <p className="text-gray-500">{developer.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <CapacityGauge value={developer.capacity} />
            <p className="text-sm font-medium text-gray-900 mt-2">Current Capacity</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Burnout Risk:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(developer.burnoutRisk)}`}>
                {developer.burnoutRisk}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Trend:</span>
              <div className="flex items-center space-x-1">
                {getTrendIcon(developer.trend)}
                <span className="text-sm text-gray-900 capitalize">{developer.trend}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Velocity:</span>
              <span className="text-sm font-medium text-gray-900">{developer.velocity}/100</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Late Night Commits</p>
              <p className="font-medium">{developer.keyMetrics.lateNightCommits}</p>
            </div>
            <div>
              <p className="text-gray-600">Weekend Activity</p>
              <p className="font-medium">{developer.keyMetrics.weekendActivity}h</p>
            </div>
            <div>
              <p className="text-gray-600">Review Response</p>
              <p className="font-medium">{developer.keyMetrics.reviewResponseTime}</p>
            </div>
            <div>
              <p className="text-gray-600">Code Quality</p>
              <p className="font-medium">{developer.keyMetrics.codeQuality}%</p>
            </div>
          </div>
        </div>

        {developer.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Manager Recommendations</h3>
            <ul className="space-y-2">
              {developer.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-3">
          <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
            Schedule 1:1
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            View Full History
          </button>
        </div>
      </div>
    </div>
  </div>
);