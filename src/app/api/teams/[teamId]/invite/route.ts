/**
 * API endpoint for inviting team members
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db/prisma';
import { isTeamLead } from '@/lib/auth/role-service';

/**
 * Invite a user to join a team
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { teamId: string } }
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
    
    // Check if user is a team lead or admin
    const isAuthorized = await isTeamLead(session.user.id, params.teamId);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { email, role } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Check if the team exists
    const team = await prisma.team.findUnique({
      where: { id: params.teamId },
    });
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
    });
    
    if (!user) {
      // In a real implementation, we would send an invitation email
      // For now, we'll just return an error
      return NextResponse.json(
        { error: 'User not found. Please ensure the user has registered with DevPulse.' },
        { status: 404 }
      );
    }
    
    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId: params.teamId,
        userId: user.id,
      },
    });
    
    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      );
    }
    
    // Add user to the team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: params.teamId,
        userId: user.id,
        role: role || 'MEMBER',
      },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBER_INVITE',
        entityType: 'TEAM',
        entityId: params.teamId,
        description: `User ${user.name || user.username} invited to team with role ${role || 'MEMBER'}`,
        userId: session.user.id,
        metadata: {
          teamId: params.teamId,
          invitedUserId: user.id,
          invitedUserEmail: email,
          role: role || 'MEMBER',
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'User added to team successfully',
      teamMember,
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}