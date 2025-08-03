/**
 * API endpoint for managing system settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkPermission } from '@/lib/auth/role-service';
import { PERMISSIONS } from '@/lib/types/roles';
import { prisma } from '@/lib/db/prisma';

/**
 * Get all system settings
 */
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
    
    // Check if user has permission to access system settings
    const hasPermission = await checkPermission(PERMISSIONS.ADMIN_SYSTEM);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Get all system settings
    const settings = await prisma.systemSettings.findMany({
      orderBy: {
        key: 'asc',
      },
    });
    
    // Mask encrypted values
    const maskedSettings = settings.map((setting) => ({
      ...setting,
      value: setting.isEncrypted ? '********' : setting.value,
    }));
    
    return NextResponse.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update system settings
 */
export async function PUT(req: NextRequest) {
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
    
    // Check if user has permission to update system settings
    const hasPermission = await checkPermission(PERMISSIONS.ADMIN_SYSTEM);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { settings } = body;
    
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Get all existing settings
    const existingSettings = await prisma.systemSettings.findMany();
    
    // Create a map of setting keys to IDs
    const settingMap = new Map(
      existingSettings.map((setting) => [setting.key, setting])
    );
    
    // Update settings
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const setting = settingMap.get(key);
      
      if (!setting) {
        return null;
      }
      
      // Skip encrypted settings
      if (setting.isEncrypted && value === '********') {
        return null;
      }
      
      return prisma.systemSettings.update({
        where: { id: setting.id },
        data: {
          value: String(value),
          lastModifiedBy: session.user.id,
          updatedAt: new Date(),
        },
      });
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises.filter(Boolean));
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'SYSTEM_SETTINGS_UPDATE',
        entityType: 'SYSTEM',
        entityId: 'settings',
        description: 'System settings updated',
        userId: session.user.id,
        metadata: {
          updatedKeys: Object.keys(settings),
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}