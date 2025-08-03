/**
 * Role and permission types for the application
 */

export enum UserRole {
  DEVELOPER = 'DEVELOPER',
  TEAM_LEAD = 'TEAM_LEAD',
  ADMINISTRATOR = 'ADMINISTRATOR',
}

export enum TeamRole {
  MEMBER = 'MEMBER',
  LEAD = 'LEAD',
  ADMIN = 'ADMIN',
}

export enum DataPrivacySettings {
  MINIMAL = 'MINIMAL',
  STANDARD = 'STANDARD',
  DETAILED = 'DETAILED',
}

export enum AppMode {
  LIVE = 'LIVE',
  MOCK = 'MOCK',
  DEMO = 'DEMO',
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  repositories: TeamRepository[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  team?: Team;
  user?: User;
}

export interface TeamRepository {
  id: string;
  teamId: string;
  repositoryId: string;
  createdAt: Date;
  // Relations
  team?: Team;
  repository?: Repository;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  // Relations
  user?: User;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  isEncrypted: boolean;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppModeSettings {
  id: string;
  mode: AppMode;
  mockDataSetId?: string;
  enabledFeatures: string[];
  errorSimulation?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Extend existing User type with role and permissions
export interface User {
  id: string;
  githubId: number;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  // Role-based access control
  role: UserRole;
  permissions: Permission[];
  teams: TeamMember[];
  // Relations
  repositories: Repository[];
  commits: Commit[];
  pullRequests: PullRequest[];
  issues: Issue[];
  burnoutMetrics: BurnoutMetric[];
  userSettings?: UserSettings;
  auditLogs: AuditLog[];
}

// Extend existing UserSettings type with new fields
export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  emailNotifications: boolean;
  weeklyReports: boolean;
  burnoutAlerts: boolean;
  selectedRepositories: string[];
  dashboardLayout?: Record<string, any>;
  dataPrivacy: DataPrivacySettings;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  user: User;
}

// These are placeholder interfaces to avoid TypeScript errors
// They should be imported from the appropriate files in a real implementation
export interface Repository {
  id: string;
  // other fields
}

export interface Commit {
  id: string;
  // other fields
}

export interface PullRequest {
  id: string;
  // other fields
}

export interface Issue {
  id: string;
  // other fields
}

export interface BurnoutMetric {
  id: string;
  // other fields
}

// Permission constants
export const PERMISSIONS = {
  VIEW_PERSONAL_METRICS: 'view:personal_metrics',
  VIEW_TEAM_METRICS: 'view:team_metrics',
  VIEW_BURNOUT_PERSONAL: 'view:burnout_personal',
  VIEW_BURNOUT_TEAM: 'view:burnout_team',
  MANAGE_REPOSITORIES: 'manage:repositories',
  MANAGE_TEAMS: 'manage:teams',
  CREATE_RETROSPECTIVES: 'create:retrospectives',
  ADMIN_USERS: 'admin:users',
  ADMIN_SYSTEM: 'admin:system',
  ADMIN_MOCK_MODE: 'admin:mock_mode',
};

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS = {
  [UserRole.DEVELOPER]: [
    PERMISSIONS.VIEW_PERSONAL_METRICS,
    PERMISSIONS.VIEW_BURNOUT_PERSONAL,
  ],
  [UserRole.TEAM_LEAD]: [
    PERMISSIONS.VIEW_PERSONAL_METRICS,
    PERMISSIONS.VIEW_TEAM_METRICS,
    PERMISSIONS.VIEW_BURNOUT_PERSONAL,
    PERMISSIONS.VIEW_BURNOUT_TEAM,
    PERMISSIONS.MANAGE_REPOSITORIES,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.CREATE_RETROSPECTIVES,
  ],
  [UserRole.ADMINISTRATOR]: [
    PERMISSIONS.VIEW_PERSONAL_METRICS,
    PERMISSIONS.VIEW_TEAM_METRICS,
    PERMISSIONS.VIEW_BURNOUT_PERSONAL,
    PERMISSIONS.VIEW_BURNOUT_TEAM,
    PERMISSIONS.MANAGE_REPOSITORIES,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.CREATE_RETROSPECTIVES,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_SYSTEM,
    PERMISSIONS.ADMIN_MOCK_MODE,
  ],
};