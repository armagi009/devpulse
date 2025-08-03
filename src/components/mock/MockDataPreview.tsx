'use client';

/**
 * Mock Data Preview Component
 * 
 * This component displays a preview of the selected mock data set,
 * showing statistics and sample data.
 */

import React, { useState, useEffect } from 'react';
import { getMockData } from '@/lib/mock/mock-data-store';
import { MockData } from '@/lib/types/mock';

interface MockDataPreviewProps {
  dataSet: string;
}

export default function MockDataPreview({ dataSet }: MockDataPreviewProps) {
  const [mockData, setMockData] = useState<MockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'repositories' | 'commits' | 'pullRequests' | 'issues'>('repositories');

  // Load mock data
  useEffect(() => {
    async function loadMockData() {
      if (!dataSet) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMockData(dataSet);
        setMockData(data);
      } catch (err) {
        console.error('Error loading mock data:', err);
        setError('Failed to load mock data');
      } finally {
        setIsLoading(false);
      }
    }

    loadMockData();
  }, [dataSet]);

  // If no data set is selected, show message
  if (!dataSet) {
    return (
      <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a mock data set to preview
        </p>
      </div>
    );
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading mock data...</span>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-400">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no mock data, show message
  if (!mockData) {
    return (
      <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No mock data available for this data set
        </p>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    repositories: mockData.repositories.length,
    commits: Object.values(mockData.commits).reduce((total, commits) => total + commits.length, 0),
    pullRequests: Object.values(mockData.pullRequests).reduce((total, prs) => total + prs.length, 0),
    issues: Object.values(mockData.issues).reduce((total, issues) => total + issues.length, 0),
  };

  // Get sample data for the active tab
  const getSampleData = () => {
    switch (activeTab) {
      case 'repositories':
        return mockData.repositories.slice(0, 5);
      case 'commits':
        const allCommits = Object.values(mockData.commits).flat();
        return allCommits.slice(0, 5);
      case 'pullRequests':
        const allPRs = Object.values(mockData.pullRequests).flat();
        return allPRs.slice(0, 5);
      case 'issues':
        const allIssues = Object.values(mockData.issues).flat();
        return allIssues.slice(0, 5);
      default:
        return [];
    }
  };

  const sampleData = getSampleData();

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Repositories</p>
          <p className="mt-1 text-2xl font-semibold text-blue-900 dark:text-blue-200">{stats.repositories}</p>
        </div>
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Commits</p>
          <p className="mt-1 text-2xl font-semibold text-green-900 dark:text-green-200">{stats.commits}</p>
        </div>
        <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Pull Requests</p>
          <p className="mt-1 text-2xl font-semibold text-purple-900 dark:text-purple-200">{stats.pullRequests}</p>
        </div>
        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Issues</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-900 dark:text-yellow-200">{stats.issues}</p>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('repositories')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'repositories'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Repositories
          </button>
          <button
            onClick={() => setActiveTab('commits')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'commits'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Commits
          </button>
          <button
            onClick={() => setActiveTab('pullRequests')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'pullRequests'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Pull Requests
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'issues'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Issues
          </button>
        </nav>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {activeTab === 'repositories' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Language</th>
                  </>
                )}
                {activeTab === 'commits' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">SHA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                  </>
                )}
                {activeTab === 'pullRequests' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">State</th>
                  </>
                )}
                {activeTab === 'issues' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">State</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {sampleData.map((item: any, index) => (
                <tr key={index}>
                  {activeTab === 'repositories' && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.owner.login}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.language || 'N/A'}</td>
                    </>
                  )}
                  {activeTab === 'commits' && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-500 dark:text-gray-400">{item.sha.substring(0, 7)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.commit.author.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.commit.message.length > 50 ? `${item.commit.message.substring(0, 50)}...` : item.commit.message}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.commit.author.date).toLocaleDateString()}
                      </td>
                    </>
                  )}
                  {activeTab === 'pullRequests' && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{item.number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.title.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.user.login}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          item.state === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        }`}>
                          {item.state}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'issues' && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{item.number}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.title.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.user.login}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          item.state === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {item.state}
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {sampleData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {sampleData.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-right text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Showing 5 of {stats[activeTab]} {activeTab}
          </div>
        )}
      </div>
    </div>
  );
}