'use client';

/**
 * Repository Selector Component
 * Allows users to discover and select repositories for analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Repository type with selection status
interface RepositoryWithSelection {
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

// Repository selector props
interface RepositorySelectorProps {
  onSelectionComplete?: () => void;
}

export default function RepositorySelector({ onSelectionComplete }: RepositorySelectorProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State
  const [repositories, setRepositories] = useState<RepositoryWithSelection[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
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
  const selectedRepositories = useMemo(() => 
    repositories
      .filter(repo => repo.isSelected)
      .map(repo => repo.full_name),
    [repositories]
  );
  
  // Save selected repositories
  const saveSelectedRepositories = async () => {
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
      
      // Call completion callback if provided
      if (onSelectionComplete) {
        onSelectionComplete();
      }
    } catch (err) {
      console.error('Error saving repository selection:', err);
      setError('Failed to save repository selection. Please try again later.');
    } finally {
      setSaving(false);
    }
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
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading repositories...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/30">
        <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
        <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Repository Filters</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Repositories ({repositories.length})
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedRepositories.length} selected
          </div>
        </div>
        
        {repositories.length === 0 ? (
          <div className="mt-4 rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No repositories found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
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
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {repo.name}
                      </h3>
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
        
        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSelectedRepositories}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <svg
                  className="mr-2 inline-block h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Selection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}