/**
 * Schema Compatibility Script
 * 
 * This script checks the database schema and ensures compatibility
 * between different versions of the application. It can be run
 * before starting the application to ensure that the database
 * schema is compatible with the code.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkSchemaCompatibility() {
  console.log('Checking database schema compatibility...');
  
  try {
    // Check if the database is accessible
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if required models exist
    const models = [
      'User',
      'Repository',
      'Commit',
      'PullRequest',
      'Issue',
      'BurnoutMetric',
      'TeamInsight',
      'Retrospective',
      'MockDataSet',
      'Permission'
    ];
    
    for (const model of models) {
      try {
        // Try to count records in the model
        const count = await prisma[model.toLowerCase()].count();
        console.log(`✅ Model ${model} exists (${count} records)`);
      } catch (error) {
        console.warn(`⚠️ Model ${model} might not exist or has issues: ${error.message}`);
      }
    }
    
    // Check if environment variables are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_USE_MOCK_AUTH',
      'NEXT_PUBLIC_USE_MOCK_API',
      'NEXT_PUBLIC_MOCK_DATA_SET'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ Environment variable ${envVar} is set to ${process.env[envVar]}`);
      } else {
        console.warn(`⚠️ Environment variable ${envVar} is not set`);
      }
    }
    
    console.log('\nSchema compatibility check completed.');
    console.log('If there are any warnings, you may need to update your database schema or environment variables.');
    console.log('You can continue using the application, but some features may not work correctly.');
    
  } catch (error) {
    console.error('❌ Error checking schema compatibility:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkSchemaCompatibility().catch(console.error);