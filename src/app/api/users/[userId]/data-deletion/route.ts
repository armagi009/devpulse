/**
 * API Route: /api/users/[userId]/data-deletion
 * 
 * Handles user data deletion requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { deleteUserData, scheduleDeletion } from '@/lib/utils/data-deletion-service';
import { z } from 'zod';

// Request body schema for immediate deletion
const deletionRequestSchema = z.object({
  reason: z.string().optional(),
  deleteType: z.enum(['soft', 'hard']),
  exportBeforeDelete: z.boolean().optional().default(true),
  entityTypes: z.array(z.string()).optional(),
});

// Request body schema for scheduled deletion
const scheduledDeletionSchema = z.object({
  scheduledDate: z.string().transform(val => new Date(val)),
  reason: z.string().optional(),
  deleteType: z.enum(['soft', 'hard']),
  exportBeforeDelete: z.boolean().optional().default(true),
  entityTypes: z.array(z.string()).optional(),
});

// POST: Delete user data immediately
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
    
    // Check if user has permission to delete this data
    const isOwnData = session.user.id === userId;
    const isAdmin = session.user.role === 'ADMINISTRATOR';
    
    if (!isOwnData && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const result = deletionRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }
    
    // Delete user data
    const deletionResult = await deleteUserData({
      userId,
      requestedBy: session.user.id,
      reason: result.data.reason,
      deleteType: result.data.deleteType,
      exportBeforeDelete: result.data.exportBeforeDelete,
      entityTypes: result.data.entityTypes,
    });
    
    if (!deletionResult.success) {
      return NextResponse.json({ error: deletionResult.message }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: deletionResult.message,
      exportData: deletionResult.exportData
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Schedule data deletion for a future date
export async function PUT(
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
    
    // Check if user has permission to schedule deletion
    const isOwnData = session.user.id === userId;
    const isAdmin = session.user.role === 'ADMINISTRATOR';
    
    if (!isOwnData && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const result = scheduledDeletionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }
    
    // Ensure scheduled date is in the future
    const now = new Date();
    if (result.data.scheduledDate <= now) {
      return NextResponse.json({ error: 'Scheduled date must be in the future' }, { status: 400 });
    }
    
    // Schedule data deletion
    const scheduledResult = await scheduleDeletion(
      userId,
      session.user.id,
      result.data.scheduledDate,
      {
        reason: result.data.reason,
        deleteType: result.data.deleteType,
        exportBeforeDelete: result.data.exportBeforeDelete,
        entityTypes: result.data.entityTypes,
      }
    );
    
    if (!scheduledResult.success) {
      return NextResponse.json({ error: scheduledResult.message }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: scheduledResult.message,
      scheduledDate: result.data.scheduledDate
    });
  } catch (error) {
    console.error('Error scheduling data deletion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}