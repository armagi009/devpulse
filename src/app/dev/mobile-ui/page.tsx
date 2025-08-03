'use client';

/**
 * Mobile UI Demo Page
 * 
 * This page demonstrates the mobile-first components and layouts
 * for the DevPulse application.
 */

import React, { useState } from 'react';
import { MobileLayout, MobileCard, MobileList, MobileListItem } from '@/components/layout/MobileLayout';
import { MobileBottomNavigation, MobileBottomSheet, MobileActionButton } from '@/components/layout/MobileBottomNavigation';
import { MobileDataList, MobileMetricCard, MobileDataGrid, MobileSummaryExpander, MobileSwipeableList } from '@/components/ui/MobileDataDisplay';
import { ProgressiveDisclosure, ProgressiveTabs, ProgressiveSteps } from '@/components/ui/ProgressiveDisclosure';
import { TouchFriendlyButton } from '@/components/ui/TouchFriendlyControls';

export default function MobileUIPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState('step1');
  
  // Sample data for demo
  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dev/mobile-ui?tab=dashboard',
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
      label: 'Team',
      href: '/dev/mobile-ui?tab=team',
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
      label: 'Metrics',
      href: '/dev/mobile-ui?tab=metrics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      ),
    },
    {
      label: 'Profile',
      href: '/dev/mobile-ui?tab=profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];
  
  const dataListItems = [
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
          <div className="mt-2">
            <TouchFriendlyButton size="sm" variant="outline" className="mr-2">
              View Details
            </TouchFriendlyButton>
            <TouchFriendlyButton size="sm">
              Review
            </TouchFriendlyButton>
          </div>
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
          <div className="mt-2">
            <TouchFriendlyButton size="sm">
              Fix Issue
            </TouchFriendlyButton>
          </div>
        </div>
      ),
    },
    {
      id: '3',
      title: 'Code Review Request',
      subtitle: 'Feature: Progressive disclosure components',
      value: '3h ago',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      details: (
        <div className="space-y-2 text-sm">
          <p>Requested by: Alex Johnson</p>
          <p>Files changed: 5</p>
          <p>Due by: Tomorrow</p>
        </div>
      ),
    },
  ];
  
  const swipeableItems = [
    {
      id: '1',
      content: (
        <div>
          <div className="font-medium">Team Retrospective</div>
          <div className="text-sm text-muted-foreground">Scheduled for tomorrow at 10:00 AM</div>
        </div>
      ),
      leftAction: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        ),
        label: 'Complete',
        onClick: () => console.log('Marked as complete'),
        color: 'bg-green-500 text-white',
      },
      rightAction: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        ),
        label: 'Delete',
        onClick: () => console.log('Deleted item'),
      },
    },
    {
      id: '2',
      content: (
        <div>
          <div className="font-medium">Code Review</div>
          <div className="text-sm text-muted-foreground">PR #123 needs your attention</div>
        </div>
      ),
      leftAction: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        ),
        label: 'Archive',
        onClick: () => console.log('Archived item'),
        color: 'bg-blue-500 text-white',
      },
      rightAction: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        ),
        label: 'Assign',
        onClick: () => console.log('Assign item'),
        color: 'bg-purple-500 text-white',
      },
    },
  ];
  
  // Header component for the page
  const header = (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-xl font-bold">Mobile UI</h1>
      <button className="rounded-full p-2 hover:bg-muted">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  );
  
  return (
    <div className="bg-background min-h-screen pb-16">
      <MobileLayout header={header}>
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Mobile Components Demo</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This page demonstrates the mobile-first components for the DevPulse application.
              Resize your browser to see how components adapt to different screen sizes.
            </p>
            
            <ProgressiveTabs
              tabs={[
                {
                  id: 'overview',
                  label: 'Overview',
                  content: (
                    <div className="space-y-4">
                      <MobileCard title="Welcome to Mobile UI" icon={
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                      }>
                        <p className="text-sm text-muted-foreground">
                          These components are designed for mobile-first experiences with touch-friendly controls and compact layouts.
                        </p>
                        <TouchFriendlyButton className="mt-3" onClick={() => setBottomSheetOpen(true)}>
                          Open Bottom Sheet
                        </TouchFriendlyButton>
                      </MobileCard>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <MobileMetricCard
                          title="Pull Requests"
                          value="12"
                          change={{ value: 20, isPositive: true }}
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <circle cx="18" cy="18" r="3"></circle>
                              <circle cx="6" cy="6" r="3"></circle>
                              <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
                              <line x1="6" y1="9" x2="6" y2="21"></line>
                            </svg>
                          }
                        />
                        
                        <MobileMetricCard
                          title="Issues"
                          value="5"
                          change={{ value: 10, isPositive: false }}
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="8" x2="12" y2="12"></line>
                              <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                          }
                        />
                      </div>
                      
                      <MobileSummaryExpander
                        summary={
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Progressive Disclosure Example
                          </div>
                        }
                        details={
                          <div className="space-y-2">
                            <p className="text-sm">
                              This component progressively reveals complex information to improve usability on small screens.
                            </p>
                            <p className="text-sm">
                              Users can tap to expand and see additional details when needed.
                            </p>
                          </div>
                        }
                      />
                    </div>
                  ),
                },
                {
                  id: 'lists',
                  label: 'Lists',
                  content: (
                    <div className="space-y-4">
                      <h3 className="text-base font-medium mb-2">Data Lists</h3>
                      <MobileDataList
                        items={dataListItems}
                        expandable={true}
                      />
                      
                      <h3 className="text-base font-medium mb-2 mt-6">Swipeable Lists</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Swipe left or right to reveal actions
                      </p>
                      <MobileSwipeableList items={swipeableItems} />
                    </div>
                  ),
                },
                {
                  id: 'steps',
                  label: 'Steps',
                  content: (
                    <div className="space-y-4">
                      <h3 className="text-base font-medium mb-2">Progressive Steps</h3>
                      <ProgressiveSteps
                        steps={[
                          {
                            id: 'step1',
                            label: 'Details',
                            content: (
                              <div className="space-y-4">
                                <p className="text-sm">
                                  Step 1: Enter basic details for your report.
                                </p>
                                <TouchFriendlyButton onClick={() => setCurrentStep('step2')}>
                                  Continue
                                </TouchFriendlyButton>
                              </div>
                            ),
                          },
                          {
                            id: 'step2',
                            label: 'Select',
                            content: (
                              <div className="space-y-4">
                                <p className="text-sm">
                                  Step 2: Select metrics to include in your report.
                                </p>
                                <div className="flex space-x-2">
                                  <TouchFriendlyButton variant="outline" onClick={() => setCurrentStep('step1')}>
                                    Back
                                  </TouchFriendlyButton>
                                  <TouchFriendlyButton onClick={() => setCurrentStep('step3')}>
                                    Continue
                                  </TouchFriendlyButton>
                                </div>
                              </div>
                            ),
                          },
                          {
                            id: 'step3',
                            label: 'Review',
                            content: (
                              <div className="space-y-4">
                                <p className="text-sm">
                                  Step 3: Review and generate your report.
                                </p>
                                <div className="flex space-x-2">
                                  <TouchFriendlyButton variant="outline" onClick={() => setCurrentStep('step2')}>
                                    Back
                                  </TouchFriendlyButton>
                                  <TouchFriendlyButton>
                                    Generate Report
                                  </TouchFriendlyButton>
                                </div>
                              </div>
                            ),
                          },
                        ]}
                        currentStepId={currentStep}
                        onStepChange={setCurrentStep}
                      />
                    </div>
                  ),
                },
              ]}
              defaultTabId="overview"
            />
          </section>
        </div>
      </MobileLayout>
      
      {/* Bottom Sheet */}
      <MobileBottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Bottom Sheet Example"
      >
        <div className="space-y-4">
          <p className="text-sm">
            This is a bottom sheet component that slides up from the bottom of the screen.
            It's commonly used for additional actions or information.
          </p>
          
          <MobileList>
            <MobileListItem
              leading={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              }
              onClick={() => console.log('Edit clicked')}
            >
              Edit
            </MobileListItem>
            <MobileListItem
              leading={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              }
              onClick={() => console.log('Share clicked')}
            >
              Share
            </MobileListItem>
            <MobileListItem
              leading={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-red-500">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              }
              onClick={() => console.log('Delete clicked')}
            >
              <span className="text-red-500">Delete</span>
            </MobileListItem>
          </MobileList>
          
          <TouchFriendlyButton
            variant="outline"
            fullWidth
            onClick={() => setBottomSheetOpen(false)}
          >
            Close
          </TouchFriendlyButton>
        </div>
      </MobileBottomSheet>
      
      {/* Action Button */}
      <MobileActionButton
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        }
        onClick={() => console.log('Action button clicked')}
        label="Add new item"
      />
      
      {/* Bottom Navigation */}
      <MobileBottomNavigation items={navigationItems} />
    </div>
  );
}