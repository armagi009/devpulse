'use client';

export const dynamic = 'force-dynamic';

/**
 * Mobile Dashboard Page
 * 
 * A mobile-optimized dashboard that demonstrates the mobile optimization features.
 * This page showcases responsive layouts, touch interactions, and network-aware loading.
 */

import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import MobileBottomNavigation from '@/components/layout/MobileBottomNavigation';
import { MobileDataList, MobileMetricCard } from '@/components/ui/MobileDataDisplay';
import { NetworkAwareLoading, OptimizedImage } from '@/components/ui/NetworkAwareLoading';
import MobileOptimizedChart from '@/components/charts/MobileOptimizedChart';
import { TouchFriendlyButton } from '@/components/ui/TouchFriendlyControls';
import { useTouchHandlers } from '@/lib/utils/touch-interactions';

export default function MobileDashboardPage() {
  // Temporarily simplified for build compatibility
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mobile Dashboard</h1>
      <p className="text-gray-600">Mobile-optimized dashboard coming soon.</p>
    </div>
  );
}

function MobileDashboardPageFull() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data for charts
  const productivityData = [
    { label: 'Mon', value: 42 },
    { label: 'Tue', value: 63 },
    { label: 'Wed', value: 52 },
    { label: 'Thu', value: 78 },
    { label: 'Fri', value: 91 },
    { label: 'Sat', value: 25 },
    { label: 'Sun', value: 12 },
  ];
  
  const burnoutFactors = [
    { label: 'Work Hours', value: 75, color: '#ef4444' },
    { label: 'Code Quality', value: 45, color: '#f59e0b' },
    { label: 'Collaboration', value: 82, color: '#10b981' },
    { label: 'Workload', value: 68, color: '#3b82f6' },
  ];
  
  const teamVelocity = [
    { label: 'Week 1', value: 23 },
    { label: 'Week 2', value: 28 },
    { label: 'Week 3', value: 35 },
    { label: 'Week 4', value: 32 },
    { label: 'Week 5', value: 38 },
  ];
  
  // Sample data for notifications
  const notificationItems = [
    {
      id: '1',
      title: 'Pull Request #123',
      subtitle: 'Feature: Add mobile navigation',
      value: '2h ago',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="18" cy="18" r="3"></circle>
          <circle cx="6" cy="6" r="3"></circle>
          <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
          <line x1="6" y1="9" x2="6" y2="21"></line>
        </svg>
      ),
      badge: (
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          Open
        </span>
      ),
      details: (
        <div className="space-y-2 text-sm">
          <p>Created by: John Doe</p>
          <p>Comments: 5</p>
          <p>Changes: +120 -35</p>
        </div>
      ),
    },
    {
      id: '2',
      title: 'Issue #456',
      subtitle: 'Bug: Mobile layout breaks on small screens',
      value: '1d ago',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ),
      badge: (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
          Critical
        </span>
      ),
      details: (
        <div className="space-y-2 text-sm">
          <p>Reported by: Jane Smith</p>
          <p>Assigned to: You</p>
          <p>Affected components: MobileLayout, Navigation</p>
        </div>
      ),
    },
  ];
  
  // Touch handlers for swipe navigation
  const touchHandlers = useTouchHandlers({
    onSwipe: (event) => {
      if (event.direction === 'left') {
        if (activeTab === 'overview') setActiveTab('productivity');
        else if (activeTab === 'productivity') setActiveTab('team');
      } else if (event.direction === 'right') {
        if (activeTab === 'team') setActiveTab('productivity');
        else if (activeTab === 'productivity') setActiveTab('overview');
      }
    },
  });
  
  // Header component
  const header = (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-xl font-bold">DevPulse Mobile</h1>
      <div className="flex items-center">
        <button className="rounded-full p-2 hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        <button className="rounded-full p-2 hover:bg-muted ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>
  );
  
  // Navigation items
  const navigationItems = [
    {
      label: 'Overview',
      href: '#overview',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      label: 'Productivity',
      href: '#productivity',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      label: 'Team',
      href: '#team',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      badge: '3',
    },
    {
      label: 'Profile',
      href: '#profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];
  
  // Tab navigation
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <NetworkAwareLoading>
                <MobileMetricCard
                  title="Burnout Risk"
                  value="42"
                  change={{ value: 5, isPositive: false }}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  }
                />
              </NetworkAwareLoading>
              
              <NetworkAwareLoading>
                <MobileMetricCard
                  title="Productivity"
                  value="78%"
                  change={{ value: 12, isPositive: true }}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                  }
                />
              </NetworkAwareLoading>
            </div>
            
            <NetworkAwareLoading>
              <MobileOptimizedChart
                title="Weekly Activity"
                data={productivityData}
                type="bar"
                height={200}
              />
            </NetworkAwareLoading>
            
            <NetworkAwareLoading>
              <MobileDataList
                items={notificationItems}
                expandable={true}
              />
            </NetworkAwareLoading>
            
            <div className="flex justify-center mt-6">
              <TouchFriendlyButton>
                View All Notifications
              </TouchFriendlyButton>
            </div>
          </div>
        );
        
      case 'productivity':
        return (
          <div className="space-y-4">
            <NetworkAwareLoading>
              <MobileOptimizedChart
                title="Daily Productivity"
                data={productivityData}
                type="line"
                height={200}
              />
            </NetworkAwareLoading>
            
            <NetworkAwareLoading>
              <MobileOptimizedChart
                title="Burnout Factors"
                data={burnoutFactors}
                type="donut"
                height={200}
              />
            </NetworkAwareLoading>
            
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-base font-medium mb-2">Recommendations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Take regular breaks during long coding sessions</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Consider reducing weekend work hours</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Improve code quality with more frequent reviews</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'team':
        return (
          <div className="space-y-4">
            <NetworkAwareLoading>
              <MobileOptimizedChart
                title="Team Velocity"
                data={teamVelocity}
                type="line"
                height={200}
              />
            </NetworkAwareLoading>
            
            <div className="bg-card rounded-lg border p-4">
              <h3 className="text-base font-medium mb-2">Team Members</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">JD</div>
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">Senior Developer</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-2">JS</div>
                  <div>
                    <div className="font-medium">Jane Smith</div>
                    <div className="text-xs text-muted-foreground">Frontend Developer</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2">RJ</div>
                  <div>
                    <div className="font-medium">Robert Johnson</div>
                    <div className="text-xs text-muted-foreground">Backend Developer</div>
                  </div>
                </div>
              </div>
            </div>
            
            <NetworkAwareLoading>
              <div className="bg-card rounded-lg border p-4">
                <h3 className="text-base font-medium mb-2">Knowledge Distribution</h3>
                <OptimizedImage
                  src="/images/knowledge-distribution.png"
                  mobileSrc="/images/knowledge-distribution-mobile.png"
                  lowBandwidthSrc="/images/knowledge-distribution-low.png"
                  alt="Knowledge Distribution Chart"
                  className="w-full h-auto rounded-md"
                  width={300}
                  height={200}
                />
              </div>
            </NetworkAwareLoading>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-background min-h-screen pb-16" {...touchHandlers}>
      <MobileLayout header={header}>
        <div className="mb-4">
          <div className="flex space-x-1 border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('productivity')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'productivity' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            >
              Productivity
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'team' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            >
              Team
            </button>
          </div>
        </div>
        
        {renderTabContent()}
        
        <div className="text-xs text-center text-muted-foreground mt-6">
          <p>Swipe left or right to navigate between tabs</p>
        </div>
      </MobileLayout>
      
      <MobileBottomNavigation items={navigationItems} />
    </div>
  );
}