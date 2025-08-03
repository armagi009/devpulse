/**
 * Audit Service
 * 
 * Centralized service for audit logging throughout the application
 */

import { prisma } from '@/lib/db/prisma';

export interface AuditEventData {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(data: AuditEventData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        description: data.description,
        metadata: data.metadata || {},
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      }
    });
  } catch (error) {
    // Don't let audit logging failures break the application
    console.error('Error logging audit event:', error);
  }
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs({
  userId,
  action,
  entityType,
  entityId,
  startDate,
  endDate,
  page = 1,
  limit = 20,
  sortBy = 'createdAt',
  sortOrder = 'desc'
}: {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    // Build filter conditions
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    
    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await prisma.auditLog.count({ where });
    
    // Get paginated results
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            email: true,
            avatarUrl: true,
            role: true
          }
        }
      }
    });
    
    return {
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }
}

/**
 * Get recent audit logs for a specific user or entity
 */
export async function getRecentAuditLogs({
  userId,
  entityType,
  entityId,
  limit = 10
}: {
  userId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
}) {
  try {
    // Build filter conditions
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    
    // Get recent logs
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            username: true,
            avatarUrl: true
          }
        }
      }
    });
    
    return logs;
  } catch (error) {
    console.error('Error fetching recent audit logs:', error);
    throw new Error('Failed to fetch recent audit logs');
  }
}