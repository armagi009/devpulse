/**
 * Schema Adapter Initialization
 * 
 * This module initializes the schema adapter layer and ensures
 * that the application can work with different database schemas.
 */

import { prisma } from './prisma';

/**
 * Initialize the schema adapter layer
 */
export async function initSchemaAdapter() {
  console.log('Initializing schema adapter...');
  
  try {
    // Check if the database is accessible
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if required models exist
    const requiredModels = [
      'User',
      'Repository',
      'Retrospective',
      'Permission'
    ];
    
    for (const model of requiredModels) {
      try {
        // Try to count records in the model
        const modelName = model.charAt(0).toLowerCase() + model.slice(1);
        await prisma[modelName].count();
      } catch (error) {
        console.warn(`⚠️ Model ${model} might not exist or has issues: ${error.message}`);
        console.warn(`The application will use fallbacks for ${model} operations.`);
      }
    }
    
    // Check if environment variables are set for mock mode
    const mockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
    const mockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    
    if (mockAuth || mockApi) {
      console.log('✅ Mock mode is enabled');
    } else {
      console.log('ℹ️ Mock mode is disabled');
    }
    
    console.log('Schema adapter initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing schema adapter:', error);
    console.error('The application will use fallbacks for database operations.');
  }
}

// Export a function to check if a model exists
export async function modelExists(modelName: string): Promise<boolean> {
  try {
    const name = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    await prisma[name].count();
    return true;
  } catch (error) {
    return false;
  }
}