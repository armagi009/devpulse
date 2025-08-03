/**
 * API endpoint for managing team members
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db/prisma';
import { isTeamLead } from '@/lib/auth/role-service';

/**
 * Update team member role
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
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
    const { role } = body;
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }
    
    // Get the team member
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: params.memberId },
    });
    
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    // Prevent users from changing their own role
    if (teamMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }
    
    // Update the team member role
    const updatedMember = await prisma.teamMember.update({
      where: { id: params.memberId },
      data: { role },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBER_ROLE_UPDATE',
        entityType: 'TEAM_MEMBER',
        entityId: params.memberId,
        description: `Team member role updated to ${role}`,
        userId: session.user.id,
        metadata: {
          teamId: params.teamId,
          memberId: params.memberId,
          newRole: role,
        },
      },
    });
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Remove team member
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
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
    
    // Get the team member
    const teamMember = await prisma.teamMember.findUnique({
      where: { id: params.memberId },
      include: { user: true },
    });
    
    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }
    
    // Prevent users from removing themselves
    if (teamMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 400 }
      );
    }
    
    // Remove the team member
    await prisma.teamMember.delete({
      where: { id: params.memberId },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_MEMBER_REMOVE',
        entityType: 'TEAM',
        entityId: params.teamId,
        description: `Team member ${teamMember.user.name || teamMember.user.username} removed from team`,
        userId: session.user.id,
        metadata: {
          teamId: params.teamId,
          memberId: params.memberId,
          memberName: teamMember.user.name || teamMember.user.username,
        },
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}