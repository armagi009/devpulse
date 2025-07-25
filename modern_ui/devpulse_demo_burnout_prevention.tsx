"use client";
import React, { useState, useEffect } from 'react';
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

const DevPulseDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock real-time data
  const developerData = {
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e9b8ca?w=40&h=40&fit=crop&crop=face",
    currentStreak: 12,
    wellnessScore: 78,
    riskLevel: "moderate",
    lastCommit: "23 minutes ago"
  };

  const aiInsights = {
    selfReassurance: {
      message: "You've successfully resolved 23 similar complex issues in the past 6 months. Your average resolution time for this type of problem is 2.3 days - you're right on track.",
      confidence: 89,
      historicalData: [
        { month: "Jan", resolved: 18 },
        { month: "Feb", resolved: 22 },
        { month: "Mar", resolved: 25 },
        { month: "Apr", resolved: 21 },
        { month: "May", resolved: 27 },
        { month: "Jun", resolved: 23 }
      ]
    },
    peerValidation: {
      message: "67% of your team members are also experiencing increased review cycles this sprint. This pattern typically resolves after mid-sprint adjustments.",
      teamMetrics: {
        avgReviewTime: "2.4 hours",
        yourReviewTime: "2.1 hours",
        teamStress: "moderate",
        similarExperience: 67
      }
    },
    socialProjection: {
      message: "Your code contributions have reduced system bugs by 15% this quarter. Your architectural decisions are creating measurable stability improvements.",
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
    stressLevel: 34,
    productivityTrend: "stable"
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={14} className="mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const AIInsightCard = ({ title, message, data, icon: Icon, layer }) => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 mb-4">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Icon size={20} className="text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
              Layer {layer}
            </span>
          </div>
          <p className="text-gray-700 mb-3 leading-relaxed">{message}</p>
          {data && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-lg font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ time, action, type, impact }) => {
    const typeColors = {
      success: 'text-green-600 bg-green-100',
      warning: 'text-amber-600 bg-amber-100',
      positive: 'text-blue-600 bg-blue-100',
      neutral: 'text-gray-600 bg-gray-100'
    };

    const typeIcons = {
      success: CheckCircle,
      warning: AlertTriangle,
      positive: Heart,
      neutral: Activity
    };

    const Icon = typeIcons[type];

    return (
      <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-lg ${typeColors[type]}`}>
          <Icon size={16} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{action}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          impact === 'high' ? 'bg-red-100 text-red-700' :
          impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {impact}
        </span>
      </div>
    );
  };

  const WellnessGauge = ({ label, value, color = "blue" }) => (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color === "blue" ? "#3b82f6" : color === "green" ? "#10b981" : "#f59e0b"}
            strokeWidth="3"
            strokeDasharray={`${value}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{value}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
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
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DevPulse</h1>
                  <p className="text-sm text-gray-500">Burnout Prevention Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p suppressHydrationWarning>{new Date().toLocaleTimeString()}</p>
                <p className="text-xs text-gray-500">Live Monitoring Active</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Developer Profile Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6 mb-8">
          <div className="flex items-center space-x-4">
            <img
              src={developerData.avatar}
              alt="Developer"
              className="w-16 h-16 rounded-full border-4 border-white/20"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Welcome back, {developerData.name}</h2>
              <p className="text-blue-100">
                Wellness Score: {developerData.wellnessScore}/100 • 
                Last commit: {developerData.lastCommit}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <Zap size={16} />
                <span className="font-semibold">{developerData.currentStreak} day streak</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                developerData.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                developerData.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {developerData.riskLevel} risk
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-lg shadow-sm">
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
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
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
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Trends</h3>
                <div className="grid grid-cols-4 gap-6">
                  <WellnessGauge label="Work-Life Balance" value={wellnessMetrics.workLifeBalance} color="#3b82f6" />
                  <WellnessGauge label="Code Quality" value={wellnessMetrics.codeQuality} color="#10b981" />
                  <WellnessGauge label="Collaboration" value={wellnessMetrics.collaborationHealth} color="#8b5cf6" />
                  <WellnessGauge label="Stress Level" value={100 - wellnessMetrics.stressLevel} color="#f59e0b" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Coffee size={18} className="text-amber-600" />
                    <span className="text-sm font-medium">Schedule break reminder</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Users size={18} className="text-blue-600" />
                    <span className="text-sm font-medium">Request pair programming</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar size={18} className="text-green-600" />
                    <span className="text-sm font-medium">Block focus time</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
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
        )}

        {activeTab === 'activity' && (
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
        )}

        {activeTab === 'wellness' && (
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
                          value >= 80 ? 'bg-green-500' :
                          value >= 60 ? 'bg-yellow-500' :
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
                  <li>• Reduce late-night coding sessions</li>
                  <li>• Take more regular breaks</li>
                  <li>• Increase pair programming frequency</li>
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
        )}
      </div>
    </div>
  );
};

export default DevPulseDashboard;