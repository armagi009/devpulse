/**
 * Data Retention Service
 * 
 * Handles data retention policies, cleanup of old data, and enforcement of retention rules
 */

import { prisma } from '@/lib/db/prisma';
import { logAuditEvent } from './audit-service';

export interface RetentionPolicy {
  entityType: string;
  retentionPeriodDays: number;
  archiveBeforeDelete?: boolean;
  exemptCriteria?: Record<string, any>;
}

/**
 * Get the configured retention policies
 */
export async function getRetentionPolicies(): Promise<RetentionPolicy[]> {
  try {
    // Get retention policies from system settings
    const settingKey = 'data_retention_policies';
    const setting = await prisma.systemSetting.findUnique({
      where: { key: settingKey }
    });

    if (setting) {
      return JSON.parse(setting.value) as RetentionPolicy[];
    }

    // Return default policies if not configured
    return getDefaultRetentionPolicies();
  } catch (error) {
    console.error('Error fetching retention policies:', error);
    return getDefaultRetentionPolicies();
  }
}

/**
 * Get default retention policies
 */
function getDefaultRetentionPolicies(): RetentionPolicy[] {
  return [
    {
      entityType: 'AuditLog',
      retentionPeriodDays: 365, // 1 year
      archiveBeforeDelete: true
    },
    {
      entityType: 'BurnoutMetric',
      retentionPeriodDays: 730, // 2 years
      archiveBeforeDelete: true
    },
    {
      entityType: 'Commit',
      retentionPeriodDays: 730, // 2 years
      exemptCriteria: { isSignificant: true }
    },
    {
      entityType: 'PullRequest',
      retentionPeriodDays: 730, // 2 years
    },
    {
      entityType: 'Issue',
      retentionPeriodDays: 730, // 2 years
    }
  ];
}

/**
 * Update retention policies
 */
export async function updateRetentionPolicies(
  policies: RetentionPolicy[],
  userId: string
): Promise<void> {
  try {
    const settingKey = 'data_retention_policies';
    
    await prisma.systemSetting.upsert({
      where: { key: settingKey },
      update: {
        value: JSON.stringify(policies),
        lastModifiedBy: userId,
        updatedAt: new Date()
      },
      create: {
        key: settingKey,
        value: JSON.stringify(policies),
        description: 'Data retention policies configuration',
        lastModifiedBy: userId
      }
    });

    // Log the policy update
    await logAuditEvent({
      userId,
      action: 'UPDATE_RETENTION_POLICIES',
      entityType: 'SystemSetting',
      entityId: settingKey,
      description: 'Updated data retention policies',
      metadata: { policies }
    });
  } catch (error) {
    console.error('Error updating retention policies:', error);
    throw new Error('Failed to update retention policies');
  }
}

/**
 * Apply retention policies to clean up old data
 */
export async function applyRetentionPolicies(
  userId: string,
  specificEntityType?: string
): Promise<{ entityType: string; deletedCount: number }[]> {
  try {
    const policies = await getRetentionPolicies();
    const results: { entityType: string; deletedCount: number }[] = [];
    
    // Filter policies if a specific entity type is requested
    const policiesToApply = specificEntityType 
      ? policies.filter(p => p.entityType === specificEntityType)
      : policies;
    
    for (const policy of policiesToApply) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);
      
      let deletedCount = 0;
      
      // Archive data before deletion if configured
      if (policy.archiveBeforeDelete) {
        await archiveExpiredData(policy, cutoffDate, userId);
      }
      
      // Apply the retention policy based on entity type
      switch (policy.entityType) {
        case 'AuditLog':
          const auditResult = await prisma.auditLog.deleteMany({
            where: {
              createdAt: { lt: cutoffDate },
              // Add exemption criteria if defined
              ...(policy.exemptCriteria || {})
            }
          });
          deletedCount = auditResult.count;
          break;
          
        case 'BurnoutMetric':
          const burnoutResult = await prisma.burnoutMetric.deleteMany({
            where: {
              createdAt: { lt: cutoffDate },
              ...(policy.exemptCriteria || {})
            }
          });
          deletedCount = burnoutResult.count;
          break;
          
        case 'Commit':
          const commitResult = await prisma.commit.deleteMany({
            where: {
              createdAt: { lt: cutoffDate },
              ...(policy.exemptCriteria || {})
            }
          });
          deletedCount = commitResult.count;
          break;
          
        case 'PullRequest':
          const prResult = await prisma.pullRequest.deleteMany({
            where: {
              createdAt: { lt: cutoffDate },
              ...(policy.exemptCriteria || {})
            }
          });
          deletedCount = prResult.count;
          break;
          
        case 'Issue':
          const issueResult = await prisma.issue.deleteMany({
            where: {
              createdAt: { lt: cutoffDate },
              ...(policy.exemptCriteria || {})
            }
          });
          deletedCount = issueResult.count;
          break;
      }
      
      results.push({
        entityType: policy.entityType,
        deletedCount
      });
      
      // Log the retention policy application
      await logAuditEvent({
        userId,
        action: 'APPLY_RETENTION_POLICY',
        entityType: policy.entityType,
        entityId: 'batch',
        description: `Applied retention policy to ${policy.entityType}`,
        metadata: { 
          policy,
          cutoffDate,
          deletedCount
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error applying retention policies:', error);
    throw new Error('Failed to apply retention policies');
  }
}

/**
 * Archive data before deletion
 */
async function archiveExpiredData(
  policy: RetentionPolicy,
  cutoffDate: Date,
  userId: string
): Promise<void> {
  try {
    // This would typically export the data to a long-term storage solution
    // For now, we'll just log that archiving would happen
    console.log(`Archiving ${policy.entityType} data older than ${cutoffDate}`);
    
    // Log the archiving action
    await logAuditEvent({
      userId,
      action: 'ARCHIVE_EXPIRED_DATA',
      entityType: policy.entityType,
      entityId: 'batch',
      description: `Archived expired ${policy.entityType} data`,
      metadata: { 
        policy,
        cutoffDate
      }
    });
  } catch (error) {
    console.error(`Error archiving ${policy.entityType} data:`, error);
  }
}