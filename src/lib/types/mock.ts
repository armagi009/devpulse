/**
 * Mock Types
 * Types for mock data and development mode
 */

import { Repository, Commit, PullRequest, Issue } from './github';
import { User, GitHubOAuthProfile } from './auth';

/**
 * Mock user profile with additional properties for simulating different user behaviors
 */
export interface MockUser extends GitHubOAuthProfile {
  role: 'developer' | 'team-lead' | 'manager' | 'contributor';
  workPattern: 'regular' | 'irregular' | 'overworked' | 'underutilized';
  activityLevel: 'high' | 'medium' | 'low';
  collaborationStyle: 'team-player' | 'independent' | 'mentor';
  responseTime: 'fast' | 'average' | 'slow';
  workHours: 'standard' | 'late-night' | 'early-morning' | 'weekend';
  specialties: string[];
}

/**
 * Mock data structure for storing generated mock data
 */
export interface MockData {
  repositories: Repository[];
  commits: Record<string, Commit[]>; // Key is repository full name
  pullRequests: Record<string, PullRequest[]>; // Key is repository full name
  issues: Record<string, Issue[]>; // Key is repository full name
}

/**
 * Mock data set stored in the database
 */
export interface MockDataSet {
  id: string;
  name: string;
  data: string; // JSON stringified MockData
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options for generating mock data
 */
export interface MockDataOptions {
  repositories: number;
  usersPerRepo: number;
  timeRangeInDays: number;
  activityLevel: 'low' | 'medium' | 'high';
  burnoutPatterns: boolean;
  collaborationPatterns: boolean;
}