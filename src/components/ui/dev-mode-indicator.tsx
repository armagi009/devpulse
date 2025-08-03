/**
 * Development Mode Indicator
 * 
 * This component displays a visual indicator when the application is running
 * in development mode with mock authentication or API enabled.
 * 
 * Implementation for Requirements 4.4, 4.5:
 * - Provide a UI indicator showing that mock mode is active
 * - Log mock API calls for debugging purposes
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getDevModeConfig } from '@/lib/config/dev-mode';
import { getCurrentMockUser, getAvailableMockUsers, setCurrentMockUser } from '@/lib/mock/mock-user-store';
import { MockUser } from '@/lib/types/mock';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMode } from '@/lib/context/ModeContext';
import { AppMode } from '@/lib/types/roles';

// Interface for API call logs
interface ApiCallLog {
  timestamp: Date;
  method: string;
  params?: any;
}

export default function DevModeIndicator() {
  const router = useRouter();
  const { mode, mockDataSetId, errorSimulation, isMockOrDemo } = useMode();
  const [devModeConfig, setDevModeConfig] = useState({
    useMockAuth: false,
    useMockApi: false,
    showDevModeIndicator: true,
    logMockCalls: true,
    simulateErrors: false,
    errorProbability: 0.1,
    mockDataSet: 'default'
  });
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'logs' | 'users' | 'debug'>('info');
  const [apiCallLogs, setApiCallLogs] = useState<ApiCallLog[]>([]);
  const [availableUsers, setAvailableUsers] = useState<(MockUser & { current: boolean })[]>([]);
  const [isUserSwitching, setIsUserSwitching] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load dev mode config and current user
  useEffect(() => {
    try {
      const config = getDevModeConfig();
      setDevModeConfig(config);

      if (config.useMockAuth) {
        const mockUser = getCurrentMockUser();
        setCurrentUser(mockUser);
        
        // Load available users
        const users = getAvailableMockUsers();
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Error loading dev mode config:', error);
    }
  }, []);

  // Set up listener for mock API calls
  useEffect(() => {
    if (devModeConfig.logMockCalls) {
      // Create a custom event listener for mock API calls
      const handleMockApiCall = (event: CustomEvent<ApiCallLog>) => {
        setApiCallLogs(prev => {
          // Keep only the last 50 logs to prevent memory issues
          const newLogs = [...prev, event.detail];
          if (newLogs.length > 50) {
            return newLogs.slice(-50);
          }
          return newLogs;
        });
      };

      // Add event listener
      window.addEventListener('mockApiCall' as any, handleMockApiCall as EventListener);

      // Clean up
      return () => {
        window.removeEventListener('mockApiCall' as any, handleMockApiCall as EventListener);
      };
    }
  }, [devModeConfig.logMockCalls]);

  // Scroll to bottom of logs when new logs are added
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [apiCallLogs, activeTab]);

  // Handle user switching
  const handleUserSwitch = async (userId: number) => {
    try {
      setIsUserSwitching(true);
      const user = setCurrentMockUser(userId);
      
      if (user) {
        setCurrentUser(user);
        
        // Update available users list
        const updatedUsers = getAvailableMockUsers();
        setAvailableUsers(updatedUsers);
        
        // Refresh the page to apply the new user
        router.refresh();
      }
    } catch (error) {
      console.error('Error switching mock user:', error);
    } finally {
      setIsUserSwitching(false);
    }
  };

  // Clear API call logs
  const clearApiCallLogs = () => {
    setApiCallLogs([]);
  };

  // Don't render anything if not in mock/demo mode or indicator is disabled
  if (
    !devModeConfig.showDevModeIndicator ||
    (!isMockOrDemo() && !devModeConfig.useMockAuth && !devModeConfig.useMockApi)
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end">
        {isOpen && (
          <div className="mb-2 w-80 rounded-lg bg-card border border-warning-500/30 p-4 shadow-lg animate-in">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-warning-500">
                Development Mode Active
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-4 text-muted-foreground hover:text-foreground"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            
            {/* Tabs */}
            <div className="mb-4 border-b border-border">
              <div className="flex -mb-px">
                <button
                  className={`mr-2 py-2 px-3 text-xs font-medium ${
                    activeTab === 'info'
                      ? 'border-b-2 border-warning-500 text-warning-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Info
                </button>
                <button
                  className={`mr-2 py-2 px-3 text-xs font-medium ${
                    activeTab === 'users'
                      ? 'border-b-2 border-warning-500 text-warning-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  Users
                </button>
                <button
                  className={`mr-2 py-2 px-3 text-xs font-medium ${
                    activeTab === 'logs'
                      ? 'border-b-2 border-warning-500 text-warning-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('logs')}
                >
                  API Logs
                </button>
                <button
                  className={`py-2 px-3 text-xs font-medium ${
                    activeTab === 'debug'
                      ? 'border-b-2 border-warning-500 text-warning-500'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setActiveTab('debug')}
                >
                  Debug
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="space-y-2 text-xs text-foreground">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <>
                  <div>
                    <span className="font-semibold">Application Mode:</span>{' '}
                    {mode}
                  </div>
                  <div>
                    <span className="font-semibold">Mock Auth:</span>{' '}
                    {devModeConfig.useMockAuth ? 'Enabled' : 'Disabled'}
                  </div>
                  <div>
                    <span className="font-semibold">Mock API:</span>{' '}
                    {devModeConfig.useMockApi ? 'Enabled' : 'Disabled'}
                  </div>
                  <div>
                    <span className="font-semibold">Mock Data Set:</span>{' '}
                    {mockDataSetId || devModeConfig.mockDataSet}
                  </div>
                  <div>
                    <span className="font-semibold">Error Simulation:</span>{' '}
                    {errorSimulation?.enabled 
                      ? `Enabled (${errorSimulation.rate * 100}%)` 
                      : devModeConfig.simulateErrors 
                        ? `Enabled (${devModeConfig.errorProbability * 100}%)` 
                        : 'Disabled'}
                  </div>
                  {currentUser && (
                    <div>
                      <span className="font-semibold">Current Mock User:</span>{' '}
                      {currentUser.name} (@{currentUser.login})
                    </div>
                  )}
                  {currentUser && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="badge badge-outline bg-warning-500/10 border-warning-500/30 text-warning-500">
                        {currentUser.role}
                      </span>
                      <span className="badge badge-outline bg-warning-500/10 border-warning-500/30 text-warning-500">
                        {currentUser.workPattern}
                      </span>
                      <span className="badge badge-outline bg-warning-500/10 border-warning-500/30 text-warning-500">
                        {currentUser.activityLevel}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {devModeConfig.useMockAuth && (
                      <Link
                        href="/auth/mock/select"
                        className="btn btn-sm bg-warning-500/20 text-warning-500 hover:bg-warning-500/30"
                      >
                        Switch Mock User
                      </Link>
                    )}
                    <Link
                      href="/dev/mock-data"
                      className="btn btn-sm bg-warning-500/20 text-warning-500 hover:bg-warning-500/30"
                    >
                      Manage Mock Data
                    </Link>
                  </div>
                </>
              )}
              
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="max-h-64 overflow-y-auto scrollable">
                  <div className="mb-2 flex justify-between">
                    <h4 className="font-medium">Available Mock Users</h4>
                    <span className="text-xs">{availableUsers.length} users</span>
                  </div>
                  <div className="space-y-2">
                    {availableUsers.map(user => (
                      <div 
                        key={user.id}
                        className={`flex items-center rounded border p-2 ${
                          user.current 
                            ? 'border-warning-500/50 bg-warning-500/10' 
                            : 'border-border'
                        }`}
                      >
                        <img 
                          src={user.avatar_url} 
                          alt={user.name || user.login}
                          className="h-6 w-6 rounded-full"
                        />
                        <div className="ml-2 flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">@{user.login}</div>
                        </div>
                        {!user.current && (
                          <button
                            onClick={() => handleUserSwitch(user.id)}
                            disabled={isUserSwitching}
                            className="btn btn-sm bg-warning-500/20 text-warning-500 hover:bg-warning-500/30 disabled:opacity-50"
                          >
                            {isUserSwitching ? 'Switching...' : 'Switch'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* API Logs Tab */}
              {activeTab === 'logs' && (
                <div>
                  <div className="mb-2 flex justify-between">
                    <h4 className="font-medium">Mock API Call Logs</h4>
                    <button
                      onClick={clearApiCallLogs}
                      className="btn btn-sm h-6 bg-warning-500/20 text-warning-500 hover:bg-warning-500/30"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto scrollable rounded border border-border bg-muted/20 p-2">
                    {apiCallLogs.length === 0 ? (
                      <div className="italic text-muted-foreground">
                        No API calls logged yet
                      </div>
                    ) : (
                      apiCallLogs.map((log, index) => (
                        <div key={index} className="mb-1 border-b border-border pb-1 last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <span className="font-mono font-medium">{log.method}</span>
                            <span className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {log.params && (
                            <div className="mt-1 overflow-x-auto font-mono text-xs">
                              {JSON.stringify(log.params)}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}
              
              {/* Debug Tab */}
              {activeTab === 'debug' && (
                <div>
                  <div className="mb-2">
                    <h4 className="font-medium">Debug Information</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Environment:</span>{' '}
                      {process.env.NODE_ENV}
                    </div>
                    <div>
                      <span className="font-semibold">Log API Calls:</span>{' '}
                      {devModeConfig.logMockCalls ? 'Enabled' : 'Disabled'}
                    </div>
                    <div>
                      <span className="font-semibold">Browser:</span>{' '}
                      {typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}
                    </div>
                    <div className="pt-2">
                      <Link
                        href="/api/health"
                        target="_blank"
                        className="btn btn-sm bg-warning-500/20 text-warning-500 hover:bg-warning-500/30"
                      >
                        Health Check
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-full bg-warning-500 p-2 text-white shadow-lg hover:bg-warning-600"
          title="Development Mode"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}