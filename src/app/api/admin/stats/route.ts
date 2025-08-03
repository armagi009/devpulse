/**
 * Mock Admin Stats API
 * Provides mock admin statistics data
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/stats
 * Get mock admin statistics
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    stats: {
      totalUsers: 125,
      activeUsers: 87,
      totalTeams: 15,
      totalRepositories: 42,
      averageCommitsPerDay: 34,
      averagePullRequestsPerDay: 12,
    },
    timestamp: new Date().toISOString(),
  });
}