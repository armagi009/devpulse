/**
 * API Route: /api/users/[userId]/data-export
 * 
 * Handles exporting user data in various formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { exportUserData, ExportFormat } from '@/lib/utils/data-export-service';
import { z } from 'zod';

// Request body schema
const exportRequestSchema = z.object({
  entityTypes: z.array(z.string()),
  format: z.enum(['json', 'csv', 'pdf']),
  dateRange: z.object({
    start: z.string().transform(val => new Date(val)),
    end: z.string().transform(val => new Date(val)),
  }).optional(),
  includePersonalData: z.boolean().optional().default(true),
  includeRepositoryData: z.boolean().optional().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has permission to export this data
    const isOwnData = session.user.id === userId;
    const isAdmin = session.user.role === 'ADMINISTRATOR';
    
    if (!isOwnData && !isAdmin) {
      // Check if user is a team lead for this user
      // This would be implemented in a real application
      // For now, only allow self-export or admin export
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const result = exportRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }
    
    // Export user data
    const exportResult = await exportUserData({
      userId,
      requestedBy: session.user.id,
      entityTypes: result.data.entityTypes,
      format: result.data.format as ExportFormat,
      dateRange: result.data.dateRange,
      includePersonalData: result.data.includePersonalData,
      includeRepositoryData: result.data.includeRepositoryData,
    });
    
    // Set appropriate headers based on format
    const headers: HeadersInit = {
      'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
    };
    
    switch (exportResult.format) {
      case 'json':
        headers['Content-Type'] = 'application/json';
        break;
      case 'csv':
        headers['Content-Type'] = 'text/csv';
        break;
      case 'pdf':
        headers['Content-Type'] = 'application/pdf';
        break;
    }
    
    return new NextResponse(exportResult.data, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}