/**
 * API Route: /api/admin/audit-logs
 * 
 * Handles fetching and filtering audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAuditLogs } from '@/lib/utils/audit-service';
import { z } from 'zod';

// Query parameters schema
const querySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin role
    if (session.user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const result = querySchema.safeParse(searchParams);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: result.error }, { status: 400 });
    }
    
    // Get audit logs with filters
    const { 
      userId, action, entityType, entityId, 
      startDate, endDate, page, limit, 
      sortBy, sortOrder 
    } = result.data;
    
    const auditLogs = await getAuditLogs({
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder
    });
    
    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}