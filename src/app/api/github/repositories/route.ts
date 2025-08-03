export const dynamic = 'force-dynamic';

/**
 * GitHub Repositories API Route
 * Handles repository listing and details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getGitHubApiClient } from '@/lib/github/github-api-client';
import { AppError, ErrorCode } from '@/lib/types/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/github/repositories
 * Get user repositories from GitHub
 */
export async function GET(request: NextRequest) {
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const language = searchParams.get('language') || '';
    const sort = searchParams.get('sort') || 'updated';
    const order = searchParams.get('order') || 'desc';
    
    // Get GitHub API client
    const githubClient = getGitHubApiClient();
    
    // Get repositories from GitHub
    const repositories = await githubClient.getUserRepositories();
    
    // Filter repositories
    let filteredRepos = repositories;
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRepos = filteredRepos.filter(repo => 
        repo.name.toLowerCase().includes(searchLower) || 
        (repo.description && repo.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by language
    if (language) {
      filteredRepos = filteredRepos.filter(repo => 
        repo.language && repo.language.toLowerCase() === language.toLowerCase()
      );
    }
    
    // Sort repositories
    filteredRepos.sort((a, b) => {
      let valueA, valueB;
      
      switch (sort) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'stars':
          valueA = a.stargazers_count || 0;
          valueB = b.stargazers_count || 0;
          break;
        case 'created':
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
        case 'updated':
        default:
          valueA = new Date(a.updated_at).getTime();
          valueB = new Date(b.updated_at).getTime();
          break;
      }
      
      return order === 'asc' ? 
        (valueA > valueB ? 1 : -1) : 
        (valueA < valueB ? 1 : -1);
    });
    
    // Get selected repositories from database
    const userId = session.user.id;
    let selectedRepoIds: string[] = [];
    
    // Check if we're in mock mode
    const { getDevModeConfig } = require('@/lib/config/dev-mode');
    const { useMockAuth } = getDevModeConfig();
    
    if (useMockAuth) {
      // In mock mode, use a default selection
      console.log('Using mock repository selection');
      selectedRepoIds = [];
    } else if (userId) {
      try {
        const userSettings = await prisma.userSettings.findUnique({
          where: { userId },
          select: { selectedRepositories: true },
        });
        
        selectedRepoIds = userSettings?.selectedRepositories || [];
      } catch (error) {
        console.error('Error fetching user settings:', error);
        // Continue with empty selection
      }
    }
    
    // Add selection status to repositories
    const reposWithSelection = filteredRepos.map(repo => ({
      ...repo,
      isSelected: selectedRepoIds.includes(repo.full_name),
    }));
    
    // Get unique languages for filtering
    const languages = Array.from(
      new Set(
        repositories
          .filter(repo => repo.language)
          .map(repo => repo.language)
      )
    ).sort();
    
    // Return repositories
    return NextResponse.json(
      {
        success: true,
        data: {
          repositories: reposWithSelection,
          languages,
          total: repositories.length,
          filtered: filteredRepos.length,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in repositories API route:', error);
    
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