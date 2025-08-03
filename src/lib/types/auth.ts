/**
 * Authentication Types
 * Types for authentication and user management
 */

import { Repository } from './github';

export interface User {
  id: string;
  githubId: number;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: Date;
  accessToken: string;
}

export interface GitHubOAuthProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  weeklyReports: boolean;
  burnoutAlerts: boolean;
  selectedRepositories: string[]; // Repository IDs
}

export interface UserWithRepositories extends User {
  repositories: Repository[];
}