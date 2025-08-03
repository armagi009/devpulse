'use client';

/**
 * Sync Progress Indicator Component
 * Displays the progress of repository synchronization
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { JobStatus } from '@/lib/jobs/queue-manager';

// Job progress interface
interface JobProgress {
  progress: number;
  message?: string;
  details?: any;
}

// Job interface
interface Job {
  id: string;
  type: string;
  status: JobStatus;
  progress: JobProgress;
  data: any;
  timestamp: number;
}

// Sync progress indicator props
interface SyncProgressIndicatorProps {
  jobId?: string;
  onComplete?: () => void;
  autoRefresh?: boolean;
}

export default function SyncProgressIndicator({
  jobId,
  onComplete,
  autoRefresh = true,
}: SyncProgressIndicatorProps) {
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch job status
  const fetchJobStatus = async () => {
    try {
      if (!jobId) {
        // If no job ID is provided, get the latest sync job
        const response = await fetch('/api/jobs?type=repository-sync&status=active,waiting');
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch jobs');
        }
        
        // Get the latest job
        const jobs = data.data.jobs;
        
        if (jobs.length === 0) {
          setJob(null);
          setLoading(false);
          return;
        }
        
        // Sort jobs by timestamp (newest first)
        jobs.sort((a: Job, b: Job) => b.timestamp - a.timestamp);
        
        setJob(jobs[0]);
      } else {
        // Fetch specific job
        const response = await fetch(`/api/jobs/${jobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to fetch job');
        }
        
        setJob(data.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job status:', err);
      setError('Failed to load sync status. Please try again later.');
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchJobStatus();
  }, [jobId]);
  
  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !job || job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
      return;
    }
    
    const interval = setInterval(() => {
      fetchJobStatus();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, job]);
  
  // Call onComplete when job is completed
  useEffect(() => {
    if (job?.status === JobStatus.COMPLETED && onComplete) {
      onComplete();
    }
  }, [job?.status, onComplete]);
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex h-16 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading sync status...</span>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400 dark:text-red-300"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={fetchJobStatus}
                className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-900/70"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render no job state
  if (!job) {
    return (
      <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">No sync in progress</h3>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>No repository synchronization is currently in progress.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Get progress percentage
  const progressPercentage = job.progress?.progress || 0;
  
  // Get status color
  let statusColor = 'bg-blue-600';
  let statusText = 'In Progress';
  
  if (job.status === JobStatus.COMPLETED) {
    statusColor = 'bg-green-600';
    statusText = 'Completed';
  } else if (job.status === JobStatus.FAILED) {
    statusColor = 'bg-red-600';
    statusText = 'Failed';
  } else if (job.status === JobStatus.WAITING) {
    statusColor = 'bg-yellow-600';
    statusText = 'Waiting';
  } else if (job.status === JobStatus.DELAYED) {
    statusColor = 'bg-purple-600';
    statusText = 'Delayed';
  }
  
  return (
    <div className="rounded-md bg-white p-4 shadow dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Repository Sync
        </h3>
        <span className={`rounded-full px-2 py-1 text-xs font-medium text-white ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      <div className="mb-2">
        <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`${statusColor} h-2`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{job.progress?.message || 'Processing...'}</span>
        <span>{progressPercentage}%</span>
      </div>
      
      {job.progress?.details && (
        <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Details</h4>
          <div className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {Object.entries(job.progress.details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {job.status === JobStatus.FAILED && (
        <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/30">
          <h4 className="text-xs font-medium text-red-800 dark:text-red-200">Error</h4>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            {job.data.error || 'An error occurred during synchronization.'}
          </p>
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={fetchJobStatus}
          className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}