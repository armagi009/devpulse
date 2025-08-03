/**
 * Mock Authentication API Route
 * Provides endpoints for mock authentication in development mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMockUsers, getMockUserById } from '@/lib/mock/mock-users';
import { getDevModeConfig } from '@/lib/config/dev-mode';

/**
 * GET handler for mock authentication
 * Returns a list of available mock users
 */
export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Mock authentication is only available in development mode' },
      { status: 403 }
    );
  }

  // Check if mock auth is enabled
  const config = getDevModeConfig();
  if (!config.useMockAuth) {
    return NextResponse.json(
      { error: 'Mock authentication is disabled' },
      { status: 403 }
    );
  }

  // Get all mock users
  const users = getMockUsers();

  // Return the users
  return NextResponse.json({ users });
}

/**
 * POST handler for mock authentication
 * Sets a cookie with the selected mock user ID
 */
export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Mock authentication is only available in development mode' },
      { status: 403 }
    );
  }

  // Check if mock auth is enabled
  const config = getDevModeConfig();
  if (!config.useMockAuth) {
    return NextResponse.json(
      { error: 'Mock authentication is disabled' },
      { status: 403 }
    );
  }

  try {
    // Get the user ID from the request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = getMockUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Set a cookie with the user ID
    cookies().set('mock-user-id', userId.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Return success
    return NextResponse.json({
      success: true,
      message: `Mock user ${user.name} selected`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error selecting mock user:', error);
    return NextResponse.json(
      { error: 'Failed to select mock user' },
      { status: 500 }
    );
  }
}