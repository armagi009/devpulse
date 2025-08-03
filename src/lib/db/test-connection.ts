/**
 * Test database connection
 * Simple utility to test the connection to the database
 */

import { prisma } from './prisma';

/**
 * Test the connection to the database
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Initialize the database connection
 */
export async function initializeDatabaseConnection(): Promise<void> {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Failed to initialize database connection:', error);
    throw error;
  }
}

// If this file is executed directly, test the connection
if (require.main === module) {
  testDatabaseConnection()
    .then((success) => {
      if (success) {
        console.log('Database connection test passed');
        process.exit(0);
      } else {
        console.error('Database connection test failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Error testing database connection:', error);
      process.exit(1);
    });
}