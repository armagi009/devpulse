/**
 * Data Access Service
 * Handles role-based data access controls
 */

import { prisma } from '@/lib/db/prisma';
import { UserRole, DataPrivacySettings } from '@/lib/types/roles';
import { hasPermission } from './role-service';
import { PERMISSIONS } from '@/lib/types/roles';

/**
 * Check if a user can access a repository
 */
export async function canAccessRepository(userId: string, repositoryId: string): Promise<boolean> {
  try {
    // Check if the repository exists
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });
    
    if (!repository) {
      return false;
    }
    
    // Check if the user is the owner of the repository
    if (repository.ownerId === userId) {
      return true;
    }
    
    // Check if the user is a member of a team that has access to the repository
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            repositories: {
              where: { repositoryId },
            },
          },
        },
      },
    });
    
    const hasTeamAccess = teamMemberships.some(
      (membership) => membership.team.repositories.length > 0
    );
    
    if (hasTeamAccess) {
      return true;
    }
    
    // Check if the user is an administrator
    const isAdmin = await hasPermission(userId, PERMISSIONS.ADMIN_SYSTEM);
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking repository access:', error);
    return false;
  }
}

/**
 * Check if a user can access burnout data for a specific user
 */
export async function canAccessBurnoutData(
  viewerId: string,
  targetUserId: string,
  repositoryId: string
): Promise<boolean> {
  try {
    // Users can always view their own burnout data
    if (viewerId === targetUserId) {
      return true;
    }
    
    // Check if the viewer has permission to view team burnout data
    const canViewTeamBurnout = await hasPermission(viewerId, PERMISSIONS.VIEW_BURNOUT_TEAM);
    
    if (!canViewTeamBurnout) {
      return false;
    }
    
    // Check if the viewer and target are in the same team for this repository
    const viewerTeams = await prisma.teamMember.findMany({
      where: { userId: viewerId },
      include: {
        team: {
          include: {
            repositories: {
              where: { repositoryId },
            },
          },
        },
      },
    });
    
    const targetTeams = await prisma.teamMember.findMany({
      where: { userId: targetUserId },
      include: {
        team: {
          include: {
            repositories: {
              where: { repositoryId },
            },
          },
        },
      },
    });
    
    // Check if they share any teams
    const viewerTeamIds = viewerTeams
      .filter((membership) => membership.team.repositories.length > 0)
      .map((membership) => membership.teamId);
    
    const targetTeamIds = targetTeams
      .filter((membership) => membership.team.repositories.length > 0)
      .map((membership) => membership.teamId);
    
    const sharedTeams = viewerTeamIds.filter((teamId) => targetTeamIds.includes(teamId));
    
    if (sharedTeams.length === 0) {
      return false;
    }
    
    // Check if the viewer is a team lead or admin in any of the shared teams
    const isTeamLead = await prisma.teamMember.findFirst({
      where: {
        userId: viewerId,
        teamId: { in: sharedTeams },
        role: { in: ['LEAD', 'ADMIN'] },
      },
    });
    
    return !!isTeamLead;
  } catch (error) {
    console.error('Error checking burnout data access:', error);
    return false;
  }
}

/**
 * Apply data privacy filters based on user role and settings
 */
export async function applyDataPrivacyFilters(
  userId: string,
  data: any,
  dataType: 'burnout' | 'productivity' | 'team' | 'personal'
): Promise<any> {
  try {
    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (!user) {
      return data;
    }
    
    // Get target user's privacy settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { dataPrivacy: true },
    });
    
    const privacySetting = userSettings?.dataPrivacy || DataPrivacySettings.STANDARD;
    
    // Log the data access for audit purposes
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_ACCESS',
        entityType: dataType.toUpperCase(),
        entityId: userId,
        description: `Applied ${privacySetting} privacy filters to ${dataType} data`,
        metadata: {
          privacySetting,
          dataType,
          role: user.role,
        },
      },
    });
    
    // Apply filters based on data type and privacy settings
    switch (dataType) {
      case 'burnout':
        return applyBurnoutPrivacyFilters(data, user.role as UserRole, privacySetting);
      case 'productivity':
        return applyProductivityPrivacyFilters(data, user.role as UserRole, privacySetting);
      case 'team':
        return applyTeamPrivacyFilters(data, user.role as UserRole, privacySetting);
      case 'personal':
        return applyPersonalDataPrivacyFilters(data, user.role as UserRole, privacySetting);
      default:
        return data;
    }
  } catch (error) {
    console.error('Error applying data privacy filters:', error);
    return data;
  }
}

/**
 * Apply privacy filters to burnout data
 */
function applyBurnoutPrivacyFilters(
  data: any,
  role: UserRole,
  privacySetting: DataPrivacySettings
): any {
  // For team leads and admins viewing team data, anonymize individual data
  if ((role === UserRole.TEAM_LEAD || role === UserRole.ADMINISTRATOR) && Array.isArray(data)) {
    return data.map((item) => {
      // Remove identifying information
      const { userId, user, ...anonymizedItem } = item;
      
      // Replace with anonymous identifier
      return {
        ...anonymizedItem,
        anonymousId: userId ? Buffer.from(userId).toString('base64').substring(0, 8) : 'unknown',
      };
    });
  }
  
  // For minimal privacy setting, remove detailed metrics
  if (privacySetting === DataPrivacySettings.MINIMAL) {
    if (Array.isArray(data)) {
      return data.map((item) => {
        const { avgCommitTimeHour, weekendCommits, lateNightCommits, ...basicItem } = item;
        return basicItem;
      });
    } else {
      const { avgCommitTimeHour, weekendCommits, lateNightCommits, ...basicData } = data;
      return basicData;
    }
  }
  
  return data;
}

/**
 * Apply privacy filters to productivity data
 */
function applyProductivityPrivacyFilters(
  data: any,
  role: UserRole,
  privacySetting: DataPrivacySettings
): any {
  // For minimal privacy setting, remove detailed metrics
  if (privacySetting === DataPrivacySettings.MINIMAL) {
    if (Array.isArray(data)) {
      return data.map((item) => {
        const { commitMessages, timeOfDay, ...basicItem } = item;
        return basicItem;
      });
    } else {
      const { commitMessages, timeOfDay, ...basicData } = data;
      return basicData;
    }
  }
  
  return data;
}

/**
 * Apply privacy filters to team data
 */
function applyTeamPrivacyFilters(
  data: any,
  role: UserRole,
  privacySetting: DataPrivacySettings
): any {
  // For developers, anonymize other team members
  if (role === UserRole.DEVELOPER && Array.isArray(data)) {
    return data.map((item) => {
      // If this is not the user's own data, anonymize it
      if (item.userId && item.userId !== role) {
        const { userId, user, name, email, ...anonymizedItem } = item;
        
        // Replace with anonymous identifier
        return {
          ...anonymizedItem,
          anonymousId: userId ? Buffer.from(userId).toString('base64').substring(0, 8) : 'unknown',
          name: `Team Member ${Buffer.from(userId || '').toString('base64').substring(0, 4)}`,
        };
      }
      
      return item;
    });
  }
  
  return data;
}

/**
 * Apply privacy filters to personal data
 */
function applyPersonalDataPrivacyFilters(
  data: any,
  role: UserRole,
  privacySetting: DataPrivacySettings
): any {
  // For personal data, we need to be extra careful
  
  // If the data is an array of personal information
  if (Array.isArray(data)) {
    return data.map(item => {
      // Remove sensitive fields based on privacy setting
      if (privacySetting === DataPrivacySettings.MINIMAL) {
        // Keep only the most basic information
        const { email, phone, address, personalNotes, ...basicInfo } = item;
        return basicInfo;
      } else if (privacySetting === DataPrivacySettings.STANDARD) {
        // Keep email but remove more sensitive information
        const { phone, address, personalNotes, ...standardInfo } = item;
        return standardInfo;
      }
      
      // For DETAILED, return all data
      return item;
    });
  } 
  // If it's a single object
  else if (data && typeof data === 'object') {
    if (privacySetting === DataPrivacySettings.MINIMAL) {
      // Keep only the most basic information
      const { email, phone, address, personalNotes, ...basicInfo } = data;
      return basicInfo;
    } else if (privacySetting === DataPrivacySettings.STANDARD) {
      // Keep email but remove more sensitive information
      const { phone, address, personalNotes, ...standardInfo } = data;
      return standardInfo;
    }
  }
  
  // For DETAILED or non-object data, return as is
  return data;
}

/**
 * Log data access for audit purposes
 */
export async function logDataAccess(
  userId: string,
  dataType: string,
  entityId: string,
  action: 'VIEW' | 'EXPORT' | 'MODIFY'
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: `DATA_${action}`,
        entityType: dataType.toUpperCase(),
        entityId,
        description: `User accessed ${dataType} data`,
        userId,
        metadata: {
          dataType,
          action,
        },
      },
    });
  } catch (error) {
    console.error('Error logging data access:', error);
  }
}