/**
 * Repository Selection API Route
 * Handles repository selection for analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
import { AppError, ErrorCode } from '@/lib/types/api';

/**
 * POST /api/github/repositories/selection
 * Update selected repositories
 */
export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: 'Not authenticated',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate repositories
    if (!body.repositories || !Array.isArray(body.repositories)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCode.BAD_REQUEST,
            message: 'Invalid repositories format',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    // Get user ID
    const userId = session.user.id;
    
    // Update user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        selectedRepositories: body.repositories,
        updatedAt: new Date(),
      },
      create: {
        userId,
        selectedRepositories: body.repositories,
      },
    });
    
    // Return updated settings
    return NextResponse.json(
      {
        success: true,
        data: {
          selectedRepositories: userSettings.selectedRepositories,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in repository selection API route:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.toJSON(),
          timestamp: new Date().toISOString(),
        },
        { status: error.status }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}