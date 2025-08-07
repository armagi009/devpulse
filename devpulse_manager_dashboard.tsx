import React, { useState, useEffect } from 'react';
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

const ManagerDashboard = () => {
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [timeframe, setTimeframe] = useState('week');
  const [viewMode, setViewMode] = useState('capacity');

  // Mock team data with capacity intelligence
  const teamData = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e9b8ca?w=40&h=40&fit=crop&crop=face",
      role: "Senior Frontend",
      capacity: 92,
      burnoutRisk: "high",
      trend: "declining",
      velocity: 85,
      wellnessFactor: 0.7,
      collaborationHealth: 88,
      stressMultiplier: 1.3,
      keyMetrics: {
        lateNightCommits: 8,
        weekendActivity: 12,
        reviewResponseTime: "4.2h",
        codeQuality: 78,
        teamInteractions: 23,
        mentoringHours: 2.5
      },
      alerts: [
        { type: "critical", message: "3 consecutive late-night sessions", time: "2h ago" },
        { type: "warning", message: "Code quality declining (-15%)", time: "1d ago" }
      ],
      recommendations: [
        "Redistribute 2-3 tasks from backlog",
        "Schedule wellness check-in",
        "Pair with junior dev to reduce load"
      ]
    },
    {
      id: 2,
      name: "Marcus Rodriguez", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      role: "Full Stack",
      capacity: 78,
      burnoutRisk: "moderate",
      trend: "stable",
      velocity: 92,
      wellnessFactor: 0.85,
      collaborationHealth: 95,
      stressMultiplier: 1.1,
      keyMetrics: {
        lateNightCommits: 2,
        weekendActivity: 4,
        reviewResponseTime: "1.8h",
        codeQuality: 91,
        teamInteractions: 45,
        mentoringHours: 6.5
      },
      alerts: [
        { type: "info", message: "High mentoring activity - great impact!", time: "6h ago" }
      ],
      recommendations: [
        "Consider for tech lead opportunities",
        "Maintain current healthy patterns"
      ]
    },
    {
      id: 3,
      name: "Priya Patel",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face", 
      role: "Backend Lead",
      capacity: 65,
      burnoutRisk: "low",
      trend: "improving",
      velocity: 88,
      wellnessFactor: 0.95,
      collaborationHealth: 82,
      stressMultiplier: 0.9,
      keyMetrics: {
        lateNightCommits: 1,
        weekendActivity: 0,
        reviewResponseTime: "2.1h",
        codeQuality: 94,
        teamInteractions: 38,
        mentoringHours: 4.0
      },
      alerts: [],
      recommendations: [
        "Could take on additional responsibilities",
        "Excellent work-life balance model"
      ]
    },
    {
      id: 4,
      name: "Alex Kim",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      role: "Junior Developer",
      capacity: 88,
      burnoutRisk: "moderate", 
      trend: "stable",
      velocity: 68,
      wellnessFactor: 0.75,
      collaborationHealth: 72,
      stressMultiplier: 1.2,
      keyMetrics: {
        lateNightCommits: 5,
        weekendActivity: 8,
        reviewResponseTime: "6.1h",
        codeQuality: 83,
        teamInteractions: 18,
        mentoringHours: 0.5
      },
      alerts: [
        { type: "warning", message: "Learning curve stress detected", time: "4h ago" }
      ],
      recommendations: [
        "Increase pairing sessions",
        "Assign more senior mentor",
        "Reduce complex task assignment"
      ]
    }
  ];

  const teamOverview = {
    averageCapacity: 81,
    highRiskCount: 1,
    optimalCount: 2,
    needsSupportCount: 1,
    totalVelocity: 333,
    teamMorale: 76,
    burnoutPrevented: 3,
    interventionsThisMonth: 7
  };

  const capacityDistribution = [
    { range: "0-60%", count: 0, color: "bg-green-500", label: "Underutilized" },
    { range: "60-80%", count: 2, color: "bg-blue-500", label: "Optimal" },
    { range: "80-90%", count: 1, color: "bg-yellow-500", label: "High" },
    { range: "90-100%", count: 1, color: "bg-red-500", label: "Critical" }
  ];

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100'; 
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'improving': return <ArrowUp size={16} className="text-green-600" />;
      case 'declining': return <ArrowDown size={16} className="text-red-600" />;
      case 'stable': return <Minus size={16} className="text-gray-600" />;
      default: return <Minus size={16} className="text-gray-600" />;
    }
  };

  const CapacityGauge = ({ value, size = "large" }) => {
    const radius = size === "large" ? 40 : 30;
    const strokeWidth = size === "large" ? 6 : 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const getColor = () => {
      if (value >= 90) return "#ef4444"; // red
      if (value >= 80) return "#f59e0b"; // yellow
      if (value >= 60) return "#3b82f6"; // blue
      return "#10b981"; // green
    };

    return (
      <div className={`relative ${size === "large" ? "w-24 h-24" : "w-16 h-16"}`}>
        <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="#f3f4f6"
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
          <span className={`font-bold ${size === "large" ? "text-lg" : "text-sm"} text-gray-900`}>
            {value}%
          </span>
        </div>
      </div>
    );
  };

  const DeveloperCard = ({ developer, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(developer)}
    >
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={developer.avatar}
          alt={developer.name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{developer.name}</h3>
          <p className="text-sm text-gray-500">{developer.role}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon(developer.trend)}
          <CapacityGauge value={developer.capacity} size="small" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Velocity</p>
          <p className="text-sm font-semibold text-gray-900">{developer.velocity}/100</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Wellness</p>
          <p className="text-sm font-semibold text-gray-900">{Math.round(developer.wellnessFactor * 100)}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(developer.burnoutRisk)}`}>
          {developer.burnoutRisk} risk
        </span>
        {developer.alerts.length > 0 && (
          <div className="flex items-center space-x-1">
            <Bell size={14} className="text-amber-500" />
            <span className="text-xs text-amber-600">{developer.alerts.length}</span>
          </div>
        )}
      </div>
    </div>
  );

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DevPulse Manager</h1>
                  <p className="text-sm text-gray-500">Team Capacity Intelligence Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <Settings size={16} />
                <span>Configure Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Executive Summary */}
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

        {/* Capacity Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Capacity Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {capacityDistribution.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`h-32 ${item.color} rounded-lg mb-3 flex items-end justify-center pb-2`}>
                  <span className="text-white font-bold text-xl">{item.count}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{item.range}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('capacity')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'capacity' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Capacity View
              </button>
              <button
                onClick={() => setViewMode('wellness')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'wellness' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
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

        {/* Manager Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Immediate Actions Required</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Sarah Chen - High Burnout Risk</p>
                  <p className="text-sm text-red-700 mt-1">3 consecutive late-night sessions, declining code quality</p>
                  <button className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                    Schedule 1:1
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock size={20} className="text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Alex Kim - Learning Curve Stress</p>
                  <p className="text-sm text-yellow-700 mt-1">Junior developer showing early burnout signs</p>
                  <button className="mt-2 text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors">
                    Assign Mentor
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Marcus Rodriguez - Leadership Potential</p>
                  <p className="text-sm text-green-700 mt-1">High mentoring activity, excellent capacity management</p>
                  <button className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                    Discuss Promotion
                  </button>
                </div>
              </div>
            </div>
          </div>

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
        </div>

        {/* AI Insights for Managers */}
        <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <Brain size={24} className="text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">AI Management Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-900 mb-2">Capacity Optimization</h4>
              <p className="text-purple-800 text-sm mb-3">
                Your team's current capacity distribution suggests redistributing 2-3 tasks from Sarah to Priya 
                would optimize both productivity and wellness outcomes.
              </p>
              <button className="text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors">
                View Suggestions
              </button>
            </div>
            <div>
              <h4 className="font-medium text-purple-900 mb-2">Team Dynamics</h4>
              <p className="text-purple-800 text-sm mb-3">
                Marcus's high mentoring activity is positively impacting team velocity. Consider formalizing 
                his role in onboarding new team members.
              </p>
              <button className="text-sm bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors">
                Create Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Detail Modal */}
      {selectedDeveloper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedDeveloper.avatar}
                    alt={selectedDeveloper.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedDeveloper.name}</h2>
                    <p className="text-gray-500">{selectedDeveloper.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDeveloper(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <CapacityGauge value={selectedDeveloper.capacity} />
                  <p className="text-sm font-medium text-gray-900 mt-2">Current Capacity</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Burnout Risk:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedDeveloper.burnoutRisk)}`}>
                      {selectedDeveloper.burnoutRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Trend:</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(selectedDeveloper.trend)}
                      <span className="text-sm text-gray-900 capitalize">{selectedDeveloper.trend}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Velocity:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedDeveloper.velocity}/100</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Late Night Commits</p>
                    <p className="font-medium">{selectedDeveloper.keyMetrics.lateNightCommits}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Weekend Activity</p>
                    <p className="font-medium">{selectedDeveloper.keyMetrics.weekendActivity}h</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Review Response</p>
                    <p className="font-medium">{selectedDeveloper.keyMetrics.reviewResponseTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Code Quality</p>
                    <p className="font-medium">{selectedDeveloper.keyMetrics.codeQuality}%</p>
                  </div>
                </div>
              </div>

              {selectedDeveloper.recommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Manager Recommendations</h3>
                  <ul className="space-y-2">
                    {selectedDeveloper.recommendations.map((rec, index) => (
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
      )}
    </div>
  );
};

export default ManagerDashboard;