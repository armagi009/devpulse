/**
 * Data Deletion Service
 * 
 * Handles user data deletion requests and compliance with data privacy regulations
 */

import { prisma } from '@/lib/db/prisma';
import { logAuditEvent } from './audit-service';
import { exportUserData } from './data-export-service';

export interface DeletionOptions {
  userId: string;
  requestedBy: string;
  reason?: string;
  deleteType: 'soft' | 'hard';
  exportBeforeDelete?: boolean;
  entityTypes?: string[];
}

export interface DeletionResult {
  success: boolean;
  message: string;
  exportData?: any;
}

/**
 * Delete user data
 */
export async function deleteUserData(options: DeletionOptions): Promise<DeletionResult> {
  const { userId, requestedBy, reason, deleteType, exportBeforeDelete, entityTypes } = options;
  
  try {
    // Check if the requesting user has permission to delete this data
    const canDelete = await checkDeletionPermission(userId, requestedBy);
    if (!canDelete) {
      return {
        success: false,
        message: 'Permission denied for data deletion'
      };
    }
    
    let exportData;
    
    // Export data before deletion if requested
    if (exportBeforeDelete) {
      try {
        const exportResult = await exportUserData({
          userId,
          requestedBy,
          entityTypes: entityTypes || ['User', 'UserSettings', 'BurnoutMetric', 'PullRequest', 'Issue', 'Repository'],
          format: 'json',
          includePersonalData: true,
          includeRepositoryData: true
        });
        
        exportData = exportResult.data;
      } catch (error) {
        console.error('Error exporting data before deletion:', error);
        // Continue with deletion even if export fails
      }
    }
    
    // Perform deletion based on the specified type
    if (deleteType === 'hard') {
      await performHardDeletion(userId, entityTypes);
    } else {
      await performSoftDeletion(userId, entityTypes);
    }
    
    // Log the deletion action
    await logAuditEvent({
      userId: requestedBy,
      action: `${deleteType.toUpperCase()}_DELETE_USER_DATA`,
      entityType: 'User',
      entityId: userId,
      description: `${deleteType === 'hard' ? 'Permanently' : 'Soft'} deleted user data`,
      metadata: {
        reason,
        entityTypes,
        exportBeforeDelete
      }
    });
    
    return {
      success: true,
      message: `User data ${deleteType === 'hard' ? 'permanently' : 'soft'} deleted successfully`,
      exportData
    };
  } catch (error) {
    console.error('Error deleting user data:', error);
    
    // Log the failed deletion attempt
    await logAuditEvent({
      userId: requestedBy,
      action: 'DELETE_USER_DATA_FAILED',
      entityType: 'User',
      entityId: userId,
      description: 'Failed to delete user data',
      metadata: {
        reason,
        deleteType,
        error: (error as Error).message
      }
    });
    
    return {
      success: false,
      message: 'Failed to delete user data'
    };
  }
}

/**
 * Check if the requesting user has permission to delete data
 */
async function checkDeletionPermission(userId: string, requestedBy: string): Promise<boolean> {
  // Users can always delete their own data
  if (userId === requestedBy) {
    return true;
  }
  
  // Check if the requesting user has admin permissions
  try {
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestedBy },
      select: { role: true }
    });
    
    return requestingUser?.role === 'ADMINISTRATOR';
  } catch (error) {
    console.error('Error checking deletion permission:', error);
    return false;
  }
}

/**
 * Perform hard deletion of user data
 */
async function performHardDeletion(userId: string, entityTypes?: string[]): Promise<void> {
  // Start a transaction to ensure all deletions succeed or fail together
  await prisma.$transaction(async (tx) => {
    // Delete specific entity types if provided, otherwise delete everything
    if (entityTypes) {
      if (entityTypes.includes('BurnoutMetric')) {
        await tx.burnoutMetric.deleteMany({ where: { userId } });
      }
      
      if (entityTypes.includes('PullRequest')) {
        await tx.pullRequest.deleteMany({ where: { authorId: userId } });
      }
      
      if (entityTypes.includes('Issue')) {
        await tx.issue.deleteMany({ where: { authorId: userId } });
      }
      
      if (entityTypes.includes('Commit')) {
        await tx.commit.deleteMany({ where: { authorId: userId } });
      }
      
      if (entityTypes.includes('UserSettings')) {
        await tx.userSettings.deleteMany({ where: { userId } });
      }
      
      if (entityTypes.includes('Repository')) {
        await tx.repository.deleteMany({ where: { ownerId: userId } });
      }
      
      if (entityTypes.includes('User')) {
        // Delete the user last, after all related data is deleted
        await tx.user.delete({ where: { id: userId } });
      }
    } else {
      // Delete all user data in the correct order to respect foreign key constraints
      await tx.burnoutMetric.deleteMany({ where: { userId } });
      await tx.pullRequestReview.deleteMany({ where: { reviewerId: userId } });
      await tx.pullRequest.deleteMany({ where: { authorId: userId } });
      await tx.issue.deleteMany({ where: { authorId: userId } });
      await tx.commit.deleteMany({ where: { authorId: userId } });
      await tx.userSettings.deleteMany({ where: { userId } });
      await tx.repository.deleteMany({ where: { ownerId: userId } });
      await tx.teamMember.deleteMany({ where: { userId } });
      await tx.auditLog.deleteMany({ where: { userId } });
      await tx.userToken.deleteMany({ where: { userId } });
      await tx.sensitiveData.deleteMany({ where: { userId } });
      
      // Delete the user last
      await tx.user.delete({ where: { id: userId } });
    }
  });
}

/**
 * Perform soft deletion of user data
 * 
 * This anonymizes user data rather than deleting it
 */
async function performSoftDeletion(userId: string, entityTypes?: string[]): Promise<void> {
  // Generate anonymized values
  const anonymizedEmail = `deleted-user-${Date.now()}@example.com`;
  const anonymizedUsername = `deleted-user-${Date.now()}`;
  
  // Start a transaction to ensure all updates succeed or fail together
  await prisma.$transaction(async (tx) => {
    // Anonymize user data
    await tx.user.update({
      where: { id: userId },
      data: {
        username: anonymizedUsername,
        name: 'Deleted User',
        email: anonymizedEmail,
        avatarUrl: null,
        // Keep the access token to prevent re-authentication
      }
    });
    
    // Delete sensitive data
    await tx.sensitiveData.deleteMany({ where: { userId } });
    
    // Anonymize or delete specific entity types if provided
    if (entityTypes) {
      if (entityTypes.includes('UserSettings')) {
        await tx.userSettings.update({
          where: { userId },
          data: {
            emailNotifications: false,
            weeklyReports: false,
            burnoutAlerts: false,
            dataPrivacy: 'MINIMAL'
          }
        });
      }
    } else {
      // Update user settings to disable all notifications and set minimal privacy
      await tx.userSettings.update({
        where: { userId },
        data: {
          emailNotifications: false,
          weeklyReports: false,
          burnoutAlerts: false,
          dataPrivacy: 'MINIMAL'
        }
      });
    }
  });
}

/**
 * Schedule data deletion for a future date
 */
export async function scheduleDeletion(
  userId: string,
  requestedBy: string,
  scheduledDate: Date,
  options: Omit<DeletionOptions, 'userId' | 'requestedBy'>
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if the requesting user has permission to schedule deletion
    const canDelete = await checkDeletionPermission(userId, requestedBy);
    if (!canDelete) {
      return {
        success: false,
        message: 'Permission denied for scheduling data deletion'
      };
    }
    
    // Store the scheduled deletion in the database
    // In a real implementation, this would create a record in a ScheduledDeletion table
    // For now, we'll just log it as an audit event
    
    await logAuditEvent({
      userId: requestedBy,
      action: 'SCHEDULE_DATA_DELETION',
      entityType: 'User',
      entityId: userId,
      description: `Scheduled data deletion for ${scheduledDate.toISOString()}`,
      metadata: {
        scheduledDate,
        ...options
      }
    });
    
    return {
      success: true,
      message: `Data deletion scheduled for ${scheduledDate.toISOString()}`
    };
  } catch (error) {
    console.error('Error scheduling data deletion:', error);
    return {
      success: false,
      message: 'Failed to schedule data deletion'
    };
  }
}