/**
 * Mock User Statistics API
 * Provides mock user statistics data
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/statistics/users
 * Get mock user statistics
 */
export async function GET(request: NextRequest) {
  // Get query parameters
  const url = new URL(request.url);
  const timeRange = url.searchParams.get('timeRange') || '30d';
  
  // Generate mock data based on time range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const stats = generateMockUserStats(days);
  
  return NextResponse.json({
    success: true,
    stats,
    timeRange,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Generate mock user statistics
 */
function generateMockUserStats(days: number) {
  const stats = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    stats.push({
      date: date.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 10),
      activeUsers: Math.floor(Math.random() * 50) + 20,
    });
  }
  
  return stats;
}