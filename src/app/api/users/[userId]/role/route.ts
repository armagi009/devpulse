/**
 * API endpoint for managing user roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import { UserRole } from '@/lib/types/roles';

// Role update schema
const roleUpdateSchema = z.object({
  role: z.enum([
    UserRole.DEVELOPER,
    UserRole.TEAM_LEAD,
    UserRole.ADMINISTRATOR,
  ]),
});

/**
 * PUT user role
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    
    // Check if user is updating their own role or is an admin
    const isOwnProfile = session.user.id === params.userId;
    const isAdmin = session.user.role === UserRole.ADMINISTRATOR;
    
    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate request body
    const validationResult = roleUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error },
        { status: 400 }
      );
    }
    
    // Get validated data
    const { role } = validationResult.data;
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'USER_ROLE_UPDATE',
        entityType: 'USER',
        entityId: params.userId,
        description: `User role updated to ${role}`,
        userId: session.user.id,
        metadata: {
          oldRole: session.user.role,
          newRole: role,
        },
      },
    });
    
    // Grant default permissions based on role
    if (role === UserRole.TEAM_LEAD || role === UserRole.ADMINISTRATOR) {
      // Get permissions for team leads
      const teamLeadPermissions = await prisma.permission.findMany({
        where: {
          name: {
            in: [
              'view:team_metrics',
              'view:burnout_team',
              'manage:repositories',
              'manage:teams',
              'create:retrospectives',
            ],
          },
        },
      });
      
      // Connect permissions to user
      await prisma.user.update({
        where: { id: params.userId },
        data: {
          permissions: {
            connect: teamLeadPermissions.map(p => ({ id: p.id })),
          },
        },
      });
      
      // Add additional permissions for administrators
      if (role === UserRole.ADMINISTRATOR) {
        const adminPermissions = await prisma.permission.findMany({
          where: {
            name: {
              in: [
                'admin:users',
                'admin:system',
                'admin:mock_mode',
              ],
            },
          },
        });
        
        await prisma.user.update({
          where: { id: params.userId },
          data: {
            permissions: {
              connect: adminPermissions.map(p => ({ id: p.id })),
            },
          },
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}