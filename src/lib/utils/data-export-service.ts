/**
 * Data Export Service
 * 
 * Handles exporting user data in various formats
 */

import { prisma } from '@/lib/db/prisma';
import { logAuditEvent } from './audit-service';
import { applyDataPrivacyFilters } from '@/lib/auth/data-access-service';

export type ExportFormat = 'json' | 'csv' | 'pdf';

export interface ExportOptions {
  userId: string;
  requestedBy: string;
  entityTypes: string[];
  format: ExportFormat;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includePersonalData?: boolean;
  includeRepositoryData?: boolean;
}

/**
 * Export user data
 */
export async function exportUserData(options: ExportOptions): Promise<{
  data: any;
  format: ExportFormat;
  filename: string;
}> {
  try {
    const { userId, requestedBy, entityTypes, format, dateRange, includePersonalData, includeRepositoryData } = options;
    
    // Check if the requesting user has permission to export this data
    const canExport = await checkExportPermission(userId, requestedBy);
    if (!canExport) {
      throw new Error('Permission denied for data export');
    }
    
    // Collect data based on requested entity types
    let exportData: Record<string, any> = {};
    
    // User profile data
    if (entityTypes.includes('User')) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          role: true
        }
      });
      
      if (user) {
        exportData.user = user;
      }
    }
    
    // User settings
    if (entityTypes.includes('UserSettings')) {
      const settings = await prisma.userSettings.findUnique({
        where: { userId }
      });
      
      if (settings) {
        exportData.userSettings = settings;
      }
    }
    
    // Repository data
    if (includeRepositoryData && entityTypes.includes('Repository')) {
      const repositories = await prisma.repository.findMany({
        where: { ownerId: userId },
        select: {
          id: true,
          name: true,
          fullName: true,
          isPrivate: true,
          description: true,
          language: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (repositories.length > 0) {
        exportData.repositories = repositories;
      }
    }
    
    // Burnout metrics
    if (entityTypes.includes('BurnoutMetric')) {
      const whereClause: any = { userId };
      
      if (dateRange) {
        whereClause.date = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }
      
      const burnoutMetrics = await prisma.burnoutMetric.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
      });
      
      if (burnoutMetrics.length > 0) {
        exportData.burnoutMetrics = burnoutMetrics;
      }
    }
    
    // Pull requests
    if (includeRepositoryData && entityTypes.includes('PullRequest')) {
      const whereClause: any = { authorId: userId };
      
      if (dateRange) {
        whereClause.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }
      
      const pullRequests = await prisma.pullRequest.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          title: true,
          state: true,
          createdAt: true,
          updatedAt: true,
          closedAt: true,
          mergedAt: true,
          additions: true,
          deletions: true,
          changedFiles: true,
          comments: true,
          reviewComments: true,
          repositoryId: true
        }
      });
      
      if (pullRequests.length > 0) {
        exportData.pullRequests = pullRequests;
      }
    }
    
    // Issues
    if (includeRepositoryData && entityTypes.includes('Issue')) {
      const whereClause: any = { authorId: userId };
      
      if (dateRange) {
        whereClause.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end
        };
      }
      
      const issues = await prisma.issue.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          title: true,
          state: true,
          createdAt: true,
          updatedAt: true,
          closedAt: true,
          comments: true,
          labels: true,
          repositoryId: true
        }
      });
      
      if (issues.length > 0) {
        exportData.issues = issues;
      }
    }
    
    // Apply data privacy filters if the requester is not the user
    if (userId !== requestedBy) {
      const filteredData = await applyDataPrivacyFilters(
        requestedBy,
        userId,
        exportData
      );
      
      exportData = filteredData;
    }
    
    // Format the data according to the requested format
    const formattedData = formatExportData(exportData, format);
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `devpulse-export-${userId}-${timestamp}.${format}`;
    
    // Log the export action
    await logAuditEvent({
      userId: requestedBy,
      action: 'EXPORT_USER_DATA',
      entityType: 'User',
      entityId: userId,
      description: `Exported user data in ${format} format`,
      metadata: {
        entityTypes,
        format,
        dateRange,
        includePersonalData,
        includeRepositoryData
      }
    });
    
    return {
      data: formattedData,
      format,
      filename
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error('Failed to export user data');
  }
}

/**
 * Check if the requesting user has permission to export data
 */
async function checkExportPermission(userId: string, requestedBy: string): Promise<boolean> {
  // Users can always export their own data
  if (userId === requestedBy) {
    return true;
  }
  
  // Check if the requesting user has admin permissions
  try {
    const requestingUser = await prisma.user.findUnique({
      where: { id: requestedBy },
      select: { role: true }
    });
    
    if (requestingUser?.role === 'ADMINISTRATOR') {
      return true;
    }
    
    // Check if the requesting user is a team lead for the user
    const isTeamLead = await prisma.teamMember.findFirst({
      where: {
        userId: requestedBy,
        role: 'LEAD',
        team: {
          members: {
            some: {
              userId
            }
          }
        }
      }
    });
    
    return !!isTeamLead;
  } catch (error) {
    console.error('Error checking export permission:', error);
    return false;
  }
}

/**
 * Format export data according to the requested format
 */
function formatExportData(data: any, format: ExportFormat): any {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
      
    case 'csv':
      return convertToCSV(data);
      
    case 'pdf':
      // In a real implementation, this would generate a PDF
      // For now, we'll just return JSON with a note
      return JSON.stringify({
        note: 'PDF generation would happen here in production',
        data
      }, null, 2);
      
    default:
      return JSON.stringify(data);
  }
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: Record<string, any[]>): string {
  const csvParts: string[] = [];
  
  // Process each entity type
  for (const [entityType, entities] of Object.entries(data)) {
    if (!Array.isArray(entities) || entities.length === 0) {
      continue;
    }
    
    // Add entity type header
    csvParts.push(`# ${entityType}`);
    
    // Get headers from the first entity
    const headers = Object.keys(entities[0]);
    csvParts.push(headers.join(','));
    
    // Add rows
    for (const entity of entities) {
      const row = headers.map(header => {
        const value = entity[header];
        
        // Handle different value types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      });
      
      csvParts.push(row.join(','));
    }
    
    // Add a blank line between entity types
    csvParts.push('');
  }
  
  return csvParts.join('\n');
}