/**
 * API Route: /api/admin/data-retention
 * 
 * Handles data retention policy management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRetentionPolicies, updateRetentionPolicies, applyRetentionPolicies } from '@/lib/utils/data-retention-service';
import { z } from 'zod';

// Retention policy schema
const retentionPolicySchema = z.object({
  entityType: z.string(),
  retentionPeriodDays: z.number().int().positive(),
  archiveBeforeDelete: z.boolean().optional(),
  exemptCriteria: z.record(z.any()).optional(),
});

// Request body schema for updating policies
const updatePoliciesSchema = z.object({
  policies: z.array(retentionPolicySchema),
});

// Request body schema for applying policies
const applyPoliciesSchema = z.object({
  entityType: z.string().optional(),
});

// GET: Fetch current retention policies
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
    
    // Get current retention policies
    const policies = await getRetentionPolicies();
    
    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error fetching retention policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update retention policies
export async function PUT(request: NextRequest) {
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
    
    // Parse and validate request body
    const body = await request.json();
    const result = updatePoliciesSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }
    
    // Update retention policies
    await updateRetentionPolicies(result.data.policies, session.user.id);
    
    return NextResponse.json({ success: true, message: 'Retention policies updated successfully' });
  } catch (error) {
    console.error('Error updating retention policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Apply retention policies
export async function POST(request: NextRequest) {
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
    
    // Parse and validate request body
    const body = await request.json();
    const result = applyPoliciesSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }
    
    // Apply retention policies
    const applyResults = await applyRetentionPolicies(
      session.user.id,
      result.data.entityType
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Retention policies applied successfully',
      results: applyResults
    });
  } catch (error) {
    console.error('Error applying retention policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}