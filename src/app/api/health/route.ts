/**
 * Mock Health Check API
 * Provides mock health status of application services
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Get mock health status of all services
 */
export async function GET(request: NextRequest) {
  // Return mock health status
  const response = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: [
      {
        name: 'Database',
        status: 'up',
        lastCheck: new Date().toISOString(),
      },
      {
        name: 'GitHub API',
        status: 'up',
        lastCheck: new Date().toISOString(),
      },
      {
        name: 'Authentication',
        status: 'up',
        lastCheck: new Date().toISOString(),
      },
      {
        name: 'Job Queue',
        status: 'up',
        lastCheck: new Date().toISOString(),
      },
    ],
  };
  
  return NextResponse.json(response, { status: 200 });
}