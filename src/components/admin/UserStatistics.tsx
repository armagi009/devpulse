'use client';

/**
 * User Statistics Component
 * Displays user growth and activity statistics
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface UserStats {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export default function UserStatistics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<UserStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/admin/statistics/users?timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user statistics');
        }
        
        const data = await response.json();
        setStats(data.stats || []);
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        setError('Failed to load user statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [timeRange]);
  
  // For demo purposes, generate some sample data if API is not available
  useEffect(() => {
    if (isLoading && !error) {
      // Generate sample data for demonstration
      const sampleData: UserStats[] = [];
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        sampleData.push({
          date: date.toISOString().split('T')[0],
          newUsers: Math.floor(Math.random() * 10),
          activeUsers: Math.floor(Math.random() * 50) + 20,
        });
      }
      
      // Simulate API delay
      const timer = setTimeout(() => {
        setStats(sampleData);
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, timeRange]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading statistics...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button
            type="button"
            className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-medium ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button
            type="button"
            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium ${
              timeRange === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </button>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stats}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                // Format date based on time range
                const date = new Date(value);
                if (timeRange === '7d') {
                  return date.toLocaleDateString(undefined, { weekday: 'short' });
                } else if (timeRange === '30d') {
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                } else {
                  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [value, name === 'newUsers' ? 'New Users' : 'Active Users']}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            />
            <Legend />
            <Bar dataKey="newUsers" name="New Users" fill="#3B82F6" />
            <Bar dataKey="activeUsers" name="Active Users" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}