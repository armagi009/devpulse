/**
 * User Service
 * Handles user profile data operations
 */

import { prisma } from '@/lib/db/prisma';
import { User, UserSettings } from '@prisma/client';
import { AppError, ErrorCode } from '@/lib/types/api';

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        `User with ID ${userId} not found`,
        404
      );
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Error fetching user:', error);
    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'Failed to fetch user data',
      500
    );
  }
}

/**
 * Get user with settings
 */
export async function getUserWithSettings(userId: string): Promise<User & { userSettings: UserSettings | null }> {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      // Try to get the user from the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { userSettings: true },
      });

      if (user) {
        return user;
      }

      // If user not found and we're in development, create a mock user with settings
      // Import these dynamically to avoid circular dependencies
      const { getMockUserById, convertMockUserToUser } = require('@/lib/mock/mock-users');
      const mockUser = getMockUserById(userId);
      
      if (mockUser) {
        const convertedUser = convertMockUserToUser(mockUser);
        
        // Add mock settings
        return {
          ...convertedUser,
          userSettings: {
            id: `settings-${userId}`,
            userId: userId,
            theme: 'system',
            emailNotifications: true,
            weeklyReports: true,
            burnoutAlerts: true,
            dataPrivacy: 'STANDARD',
            dashboardLayout: {},
            selectedRepositories: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }
    }

    // Standard database lookup for production or if mock user not found
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSettings: true },
    });

    if (!user) {
      throw new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        `User with ID ${userId} not found`,
        404
      );
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Error fetching user with settings:', error);
    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'Failed to fetch user data with settings',
      500
    );
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserSettings> {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      // Try to get the user from the database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { userSettings: true },
      });

      if (user) {
        // Update or create settings in the database
        if (user.userSettings) {
          return await prisma.userSettings.update({
            where: { userId },
            data: settings,
          });
        } else {
          return await prisma.userSettings.create({
            data: {
              ...settings,
              userId,
            },
          });
        }
      }

      // If user not found and we're in development, return mock settings
      // Import these dynamically to avoid circular dependencies
      const { getMockUserById } = require('@/lib/mock/mock-users');
      const mockUser = getMockUserById(userId);
      
      if (mockUser) {
        // Return mock settings with the updates applied
        return {
          id: `settings-${userId}`,
          userId: userId,
          theme: settings.theme || 'system',
          emailNotifications: settings.emailNotifications !== undefined ? settings.emailNotifications : true,
          weeklyReports: settings.weeklyReports !== undefined ? settings.weeklyReports : true,
          burnoutAlerts: settings.burnoutAlerts !== undefined ? settings.burnoutAlerts : true,
          dataPrivacy: settings.dataPrivacy || 'STANDARD',
          dashboardLayout: settings.dashboardLayout || {},
          selectedRepositories: settings.selectedRepositories || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    }

    // Standard database operations for production or if mock user not found
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userSettings: true },
    });

    if (!user) {
      throw new AppError(
        ErrorCode.RECORD_NOT_FOUND,
        `User with ID ${userId} not found`,
        404
      );
    }

    // Update or create settings
    if (user.userSettings) {
      return await prisma.userSettings.update({
        where: { userId },
        data: settings,
      });
    } else {
      return await prisma.userSettings.create({
        data: {
          ...settings,
          userId,
        },
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error('Error updating user settings:', error);
    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'Failed to update user settings',
      500
    );
  }
}

/**
 * Get user repositories
 */
export async function getUserRepositories(userId: string) {
  try {
    const repositories = await prisma.repository.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    return repositories;
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'Failed to fetch user repositories',
      500
    );
  }
}