/**
 * Data Retention Settings Component
 * 
 * Allows administrators to configure data retention policies
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RetentionPolicy {
  entityType: string;
  retentionPeriodDays: number;
  archiveBeforeDelete?: boolean;
  exemptCriteria?: Record<string, any>;
}

export default function DataRetentionSettings() {
  const router = useRouter();
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyResults, setApplyResults] = useState<any[] | null>(null);

  // Fetch current retention policies
  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch('/api/admin/data-retention');
        if (!response.ok) {
          throw new Error('Failed to fetch retention policies');
        }
        
        const data = await response.json();
        setPolicies(data.policies);
      } catch (error) {
        setError('Error loading retention policies');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPolicies();
  }, []);

  // Handle policy update
  const handlePolicyChange = (index: number, field: keyof RetentionPolicy, value: any) => {
    const updatedPolicies = [...policies];
    
    if (field === 'retentionPeriodDays') {
      updatedPolicies[index][field] = parseInt(value);
    } else {
      updatedPolicies[index][field] = value;
    }
    
    setPolicies(updatedPolicies);
  };

  // Save updated policies
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await fetch('/api/admin/data-retention', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policies }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update retention policies');
      }
      
      setSuccess('Retention policies updated successfully');
      router.refresh();
    } catch (error) {
      setError('Error updating retention policies');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Apply retention policies
  const handleApply = async (entityType?: string) => {
    try {
      setApplying(true);
      setError(null);
      setSuccess(null);
      setApplyResults(null);
      
      const response = await fetch('/api/admin/data-retention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entityType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply retention policies');
      }
      
      const result = await response.json();
      setSuccess('Retention policies applied successfully');
      setApplyResults(result.results);
      router.refresh();
    } catch (error) {
      setError('Error applying retention policies');
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Data Retention Policies
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Configure how long different types of data are retained in the system before automatic deletion.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Entity Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Retention Period (Days)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Archive Before Delete
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {policies.map((policy, index) => (
              <tr key={policy.entityType}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {policy.entityType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={policy.retentionPeriodDays}
                    onChange={(e) => handlePolicyChange(index, 'retentionPeriodDays', e.target.value)}
                    min="1"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={policy.archiveBeforeDelete || false}
                    onChange={(e) => handlePolicyChange(index, 'archiveBeforeDelete', e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-4">
        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Policies'}
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleApply()}
            disabled={applying}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply All Policies'}
          </button>
        </div>
      </div>
      
      {applyResults && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Application Results
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <ul className="space-y-2">
              {applyResults.map((result, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {result.entityType}: {result.deletedCount} records deleted
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}