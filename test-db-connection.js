/**
 * Simple test to verify database connection and Prisma client
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test SystemSettings model
    try {
      const systemSettings = await prisma.systemSettings.findMany();
      console.log('✅ SystemSettings model accessible, found', systemSettings.length, 'records');
    } catch (error) {
      console.error('❌ Error accessing SystemSettings:', error.message);
    }
    
    // Test AppMode model
    try {
      const appMode = await prisma.appMode.findFirst();
      console.log('✅ AppMode model accessible, found:', appMode ? 'record exists' : 'no records');
    } catch (error) {
      console.error('❌ Error accessing AppMode:', error.message);
    }
    
    // Test MockDataSet model
    try {
      const mockDataSets = await prisma.mockDataSet.findMany();
      console.log('✅ MockDataSet model accessible, found', mockDataSets.length, 'records');
    } catch (error) {
      console.error('❌ Error accessing MockDataSet:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

testConnection();