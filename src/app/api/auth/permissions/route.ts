/**
 * Mock API endpoint for fetching user permissions
 * Used during dry run testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';

// Default permissions for different roles
const rolePermissions = {
  ADMINISTRATOR: [
    'VIEW_DASHBOARD',
    'VIEW_TEAM',
    'MANAGE_TEAM',
    'VIEW_PRODUCTIVITY',
    'VIEW_BURNOUT_PERSONAL',
    'VIEW_BURNOUT_TEAM',
    'MANAGE_REPOSITORIES',
    'CREATE_RETROSPECTIVE',
    'MANAGE_RETROSPECTIVE',
    'VIEW_ADMIN_PANEL',
    'MANAGE_SYSTEM_SETTINGS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS'
  ],
  TEAM_LEAD: [
    'VIEW_DASHBOARD',
    'VIEW_TEAM',
    'MANAGE_TEAM',
    'VIEW_PRODUCTIVITY',
    'VIEW_BURNOUT_PERSONAL',
    'VIEW_BURNOUT_TEAM',
    'MANAGE_REPOSITORIES',
    'CREATE_RETROSPECTIVE',
    'MANAGE_RETROSPECTIVE'
  ],
  DEVELOPER: [
    'VIEW_DASHBOARD',
    'VIEW_TEAM',
    'VIEW_PRODUCTIVITY',
    'VIEW_BURNOUT_PERSONAL',
    'MANAGE_REPOSITORIES',
    'CREATE_RETROSPECTIVE'
  ],
  USER: [
    'VIEW_DASHBOARD',
    'VIEW_TEAM',
    'VIEW_PRODUCTIVITY',
    'VIEW_BURNOUT_PERSONAL'
  ]
};

export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For dry run, use a default role based on email domain
    let role = 'DEVELOPER';
    
    if (session.user.email) {
      if (session.user.email.includes('admin')) {
        role = 'ADMINISTRATOR';
      } else if (session.user.email.includes('lead')) {
        role = 'TEAM_LEAD';
      }
    }
    
    // Get permissions for the role
    const permissions = rolePermissions[role] || rolePermissions.USER;
    
    // Return role and permissions
    return NextResponse.json({
      role,
      permissions,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    
    // For dry run, return default permissions
    return NextResponse.json({
      role: 'DEVELOPER',
      permissions: rolePermissions.DEVELOPER,
    });
  }
}

// Handle POST request to update permissions (admin only)
export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { userId, permissions } = body;
    
    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // For dry run, just log the action
    console.log(`[MOCK] Permissions updated for user ${userId}: ${permissions.join(', ')}`);
    
    // Return success
    return NextResponse.json({
      success: true,
      permissions: permissions,
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}