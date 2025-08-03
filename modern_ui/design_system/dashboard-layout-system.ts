// components/layout/DashboardLayout.tsx
import { useState, ReactNode } from 'react';
import { GradientBackground, Card, Button } from '@/components/ui';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const Sidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const menuItems = [
    { icon: '📊', label: 'Overview', href: '/dashboard', active: true },
    { icon: '⚡', label: 'Burnout Radar', href: '/dashboard/burnout' },
    { icon: '📈', label: 'Analytics', href: '/dashboard/analytics' },
    { icon: '👥', label: 'Team', href: '/dashboard/team' },
    { icon: '🔍', label: 'Retrospectives', href: '/dashboard/retros' },
    { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        <Card className="h-full m-4 p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-bold">DP</span>
            </div>
            <div>
              <div className="text-xl font-bold gradient-text">DevPulse</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Dashboard</div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`sidebar-item ${item.active ? 'active' : ''}`}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="absolute bottom-6 left-6 right-6">
            <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    John Doe
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Senior Developer
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </aside>
    </>
  );
};

const TopBar = ({ onSidebarToggle, title, subtitle, actions }: {
  onSidebarToggle: () => void;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-4"
            onClick={onSidebarToggle}
          >
            ☰
          </Button>
          
          {title && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {actions}
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            🔔
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* Theme toggle */}
          <Button variant="ghost" size="sm">
            🌙
          </Button>
        </div>
      </div>
    </header>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <GradientBackground variant="dashboard">
      <div className="flex h-screen">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          <TopBar
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            title={title}
            subtitle={subtitle}
            actions={actions}
          />
          
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </GradientBackground>
  );
};

// Example Dashboard Page
export const DashboardOverview = () => {
  return (
    <DashboardLayout 
      title="Overview" 
      subtitle="Welcome back! Here's what's happening with your team."
      actions={
        <Button variant="primary" size="sm">
          Generate Report
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Burnout Risk Score"
            value="85"
            change="↑ 12%"
            trend="down"
            icon="⚡"
            gradient="from-red-500 to-orange-500"
          />
          <MetricCard
            title="Team Velocity"
            value="94%"
            change="↑ 8%"
            trend="up"
            icon="🚀"
            gradient="from-green-500 to-blue-500"
          />
          <MetricCard
            title="Code Quality"
            value="4.8"
            change="↑ 0.3"
            trend="up"
            icon="⭐"
            gradient="from-yellow-500 to-orange-500"
          />
          <MetricCard
            title="Active Issues"
            value="23"
            change="↓ 5"
            trend="up"
            icon="🎯"
            gradient="from-purple-500 to-pink-500"
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 gradient-text">
              Productivity Trends
            </h3>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Chart Component Here</span>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 gradient-text">
              Team Collaboration
            </h3>
            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Chart Component Here</span>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};