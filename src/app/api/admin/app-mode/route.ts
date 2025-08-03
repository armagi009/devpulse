/**
 * API endpoint for managing application mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { checkPermission } from '@/lib/auth/role-service';
import { PERMISSIONS } from '@/lib/types/roles';

/**
 * Get current application mode
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
    
    // Check if user has permission to access app mode
    const hasPermission = await checkPermission(PERMISSIONS.ADMIN_MOCK_MODE);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Import the schema adapter
    const { getAppMode } = await import('@/lib/db/schema-adapter');
    
    // Get app mode from adapter
    const appModeData = await getAppMode();
    
    // Create response object
    const mockAppMode = {
      id: 'mock-app-mode-id',
      mode: appModeData.mode,
      mockDataSetId: appModeData.mockDataSetId,
      enabledFeatures: appModeData.enabledFeatures,
      errorSimulation: appModeData.errorSimulation,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json({ appMode: mockAppMode });
  } catch (error) {
    console.error('Error fetching app mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update application mode
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
    
    // Check if user has permission to update app mode
    const hasPermission = await checkPermission(PERMISSIONS.ADMIN_MOCK_MODE);
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { mode, mockDataSetId, enabledFeatures, errorSimulation } = body;
    
    if (!mode) {
      return NextResponse.json(
        { error: 'Mode is required' },
        { status: 400 }
      );
    }
    
    // Validate mode
    if (!['LIVE', 'MOCK', 'DEMO'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode' },
        { status: 400 }
      );
    }
    
    // In mock mode, just log the action
    console.log(`Application mode updated to ${mode}`);
    console.log(`Mock data set: ${mockDataSetId || 'default'}`);
    console.log(`Enabled features: ${JSON.stringify(enabledFeatures || [])}`);
    console.log(`Error simulation: ${JSON.stringify(errorSimulation || null)}`);
    
    // Create mock app mode response
    const mockAppMode = {
      id: 'mock-app-mode-id',
      mode,
      mockDataSetId: mode === 'MOCK' ? mockDataSetId : null,
      enabledFeatures: Array.isArray(enabledFeatures) ? enabledFeatures : [],
      errorSimulation: errorSimulation || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      message: 'Application mode updated successfully',
      appMode: mockAppMode,
    });
  } catch (error) {
    console.error('Error updating app mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}