'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wizard, WizardStep } from '@/components/ui/wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Github, Database, BarChart } from 'lucide-react';
import { handleApiResponse, logError, formatErrorMessage } from '@/lib/utils/error-handler';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  private: boolean;
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  isSelected: boolean;
}

interface RepositorySetupWizardProps {
  onComplete?: () => void;
  initialStep?: number;
}

export default function RepositorySetupWizard({ 
  onComplete,
  initialStep = 0
}: RepositorySetupWizardProps) {
  const router = useRouter();
  
  // State
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncStarted, setSyncStarted] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  
  // Filters
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('updated');
  const [order, setOrder] = useState('desc');
  
  // Load repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (language) queryParams.append('language', language);
        queryParams.append('sort', sort);
        queryParams.append('order', order);
        
        // Fetch repositories
        const response = await fetch(`/api/github/repositories?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch repositories');
        }
        
        // Update state
        setRepositories(data.data.repositories);
        setLanguages(data.data.languages);
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError('Failed to load repositories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRepositories();
  }, [search, language, sort, order]);
  
  // Toggle repository selection
  const toggleRepositorySelection = (repoFullName: string) => {
    setRepositories(prev => 
      prev.map(repo => 
        repo.full_name === repoFullName 
          ? { ...repo, isSelected: !repo.isSelected } 
          : repo
      )
    );
  };
  
  // Get selected repositories
  const selectedRepositories = repositories
    .filter(repo => repo.isSelected)
    .map(repo => repo.full_name);
  
  // Save selected repositories
  const saveSelectedRepositories = async (): Promise<boolean> => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/github/repositories/selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositories: selectedRepositories,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save repository selection');
      }
      
      return true;
    } catch (err) {
      console.error('Error saving repository selection:', err);
      setError('Failed to save repository selection. Please try again later.');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  // Start repository sync
  const startRepositorySync = async (): Promise<boolean> => {
    try {
      setSyncStarted(true);
      setSyncStatus('syncing');
      
      const response = await fetch('/api/github/repositories/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositories: selectedRepositories,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start repository sync');
      }
      
      // Start polling for sync progress
      pollSyncProgress();
      
      return true;
    } catch (err) {
      console.error('Error starting repository sync:', err);
      setError('Failed to start repository sync. Please try again later.');
      setSyncStatus('error');
      return false;
    }
  };
  
  // Poll sync progress
  const pollSyncProgress = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/jobs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sync status');
        }
        
        const data = await response.json();
        
        if (data.jobs.some(job => job.type === 'repository-sync' && job.status === 'active')) {
          // Calculate progress based on completed jobs
          const totalJobs = data.jobs.filter(job => job.type === 'repository-sync').length;
          const completedJobs = data.jobs.filter(job => job.type === 'repository-sync' && job.status === 'completed').length;
          const progress = Math.round((completedJobs / totalJobs) * 100);
          
          setSyncProgress(progress);
          setSyncStatus('syncing');
        } else if (data.jobs.some(job => job.type === 'repository-sync' && job.status === 'failed')) {
          setSyncStatus('error');
          clearInterval(interval);
        } else if (data.jobs.every(job => job.type !== 'repository-sync' || job.status === 'completed')) {
          setSyncProgress(100);
          setSyncStatus('completed');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling sync status:', err);
        setSyncStatus('error');
        clearInterval(interval);
      }
    }, 2000);
    
    // Clean up interval
    return () => clearInterval(interval);
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  // Handle language filter change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };
  
  // Handle order change
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(e.target.value);
  };
  
  // Handle wizard completion
  const handleWizardComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      router.push('/dashboard');
    }
  };
  
  return (
    <Wizard onComplete={handleWizardComplete} className="max-w-4xl mx-auto">
      {/* Step 1: Connect to GitHub */}
      <WizardStep 
        title="Connect to GitHub" 
        description="Connect your GitHub account to access repositories"
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            DevPulse needs access to your GitHub repositories to analyze your team's activity and provide insights.
            We use GitHub's OAuth to securely connect to your account.
          </p>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-gray-100 p-6 rounded-full mb-4 dark:bg-gray-800">
              <Github className="h-12 w-12 text-gray-800 dark:text-gray-200" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              GitHub Connection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
              We'll only request the minimum permissions needed to analyze your repositories.
            </p>
            
            <div className="space-y-4 w-full max-w-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Read access to your repositories
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Read access to your profile information
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Read access to your organization membership
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p className="flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Note:</strong> DevPulse never stores your GitHub credentials and uses secure OAuth tokens for access.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
      
      {/* Step 2: Select Repositories */}
      <WizardStep 
        title="Select Repositories" 
        description="Choose which repositories to analyze"
        onNext={saveSelectedRepositories}
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Select the repositories you want to analyze. You can filter by name, language, and other criteria.
          </p>
          
          {/* Filters */}
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Repository Filters</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search repositories..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              
              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={handleSortChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="updated">Last Updated</option>
                  <option value="name">Name</option>
                  <option value="stars">Stars</option>
                  <option value="created">Created Date</option>
                </select>
              </div>
              
              {/* Order */}
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order
                </label>
                <select
                  id="order"
                  value={order}
                  onChange={handleOrderChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Repository List */}
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Repositories ({repositories.length})
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedRepositories.length} selected
              </div>
            </div>
            
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading repositories...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/30">
                <h4 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h4>
                <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
                <Button
                  onClick={() => router.refresh()}
                  variant="destructive"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : repositories.length === 0 ? (
              <div className="mt-4 rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-700">
                <p className="text-gray-500 dark:text-gray-400">
                  No repositories found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {repositories.map(repo => (
                  <div key={repo.id} className="py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={repo.isSelected}
                          onChange={() => toggleRepositorySelection(repo.full_name)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white">
                            {repo.name}
                          </h4>
                          {repo.private && (
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Private
                            </span>
                          )}
                          {repo.language && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {repo.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <svg
                              className="mr-1 h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                          <span className="ml-4 flex items-center">
                            <svg
                              className="mr-1 h-4 w-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {repo.stargazers_count} stars
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedRepositories.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 text-sm dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
              <p className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> You must select at least one repository to continue.
                </span>
              </p>
            </div>
          )}
        </div>
      </WizardStep>
      
      {/* Step 3: Sync Repositories */}
      <WizardStep 
        title="Sync Repositories" 
        description="Sync your selected repositories to analyze data"
        onNext={startRepositorySync}
      >
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            We need to sync your selected repositories to analyze the data. This process may take a few minutes
            depending on the size and number of repositories.
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Selected Repositories
            </h3>
            
            <div className="space-y-2 mb-6">
              {selectedRepositories.map(repo => (
                <div key={repo} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{repo}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    We'll sync commit history, pull requests, and issues
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Generate metrics and insights from your repository data
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {syncStarted && (
            <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Sync Progress
              </h3>
              
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>{syncProgress}% Complete</span>
                  <span>
                    {syncStatus === 'syncing' && 'Syncing...'}
                    {syncStatus === 'completed' && 'Sync completed!'}
                    {syncStatus === 'error' && 'Sync error'}
                  </span>
                </div>
                
                {syncStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                    <p className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>
                        <strong>Error:</strong> There was a problem syncing your repositories. You can continue with partial data or try again later.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p className="flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Note:</strong> Initial sync may take several minutes for large repositories. You can continue to the next step while syncing continues in the background.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
      
      {/* Step 4: Setup Complete */}
      <WizardStep 
        title="Setup Complete" 
        description="Your repositories are ready for analysis"
        completeLabel="Go to Dashboard"
      >
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Repository Setup Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Your repositories are now connected and being analyzed. You can start exploring insights and metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4 dark:bg-blue-900/30 dark:text-blue-400">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Team Analytics
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Explore team performance metrics and collaboration patterns
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mb-4 dark:bg-purple-900/30 dark:text-purple-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Burnout Prevention
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Monitor team health and identify potential burnout risks
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4 dark:bg-green-900/30 dark:text-green-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Retrospectives
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Generate AI-powered retrospectives for continuous improvement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
            <p className="flex items-start">
              <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <span>
                <strong>Tip:</strong> You can add more repositories or adjust your settings at any time from your profile.
              </span>
            </p>
          </div>
        </div>
      </WizardStep>
    </Wizard>
  );
}