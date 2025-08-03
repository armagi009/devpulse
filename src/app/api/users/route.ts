/**
 * API endpoint for listing users
 * Restricted to administrators
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { hasPermission } from '@/lib/auth/role-service';
import { PERMISSIONS } from '@/lib/types/roles';

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
    
    // Check if user has admin rights
    const canManageUsers = await hasPermission(session.user.id, PERMISSIONS.ADMIN_USERS);
    if (!canManageUsers) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get users with their permissions
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        permissions: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Get total count
    const totalCount = await prisma.user.count();
    
    // Return users
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}