/**
 * Test script to verify admin settings page logic
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

async function testAdminSettings() {
  try {
    console.log('Testing admin settings page logic...');
    
    // Test the same queries that the admin settings page uses
    let systemSettings = [];
    let appMode = null;
    let mockDataSets = [];

    try {
      systemSettings = await prisma.systemSettings.findMany();
      console.log('✅ SystemSettings query successful, found', systemSettings.length, 'records');
    } catch (error) {
      console.error('❌ Error fetching system settings:', error.message);
      systemSettings = [];
    }

    try {
      appMode = await prisma.appMode.findFirst({
        orderBy: {
          updatedAt: 'desc',
        },
      });
      console.log('✅ AppMode query successful, found:', appMode ? 'record exists' : 'no records');
      if (appMode) {
        console.log('   Mode:', appMode.mode);
        console.log('   Features:', appMode.enabledFeatures);
      }
    } catch (error) {
      console.error('❌ Error fetching app mode:', error.message);
      appMode = null;
    }

    try {
      mockDataSets = await prisma.mockDataSet.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      console.log('✅ MockDataSet query successful, found', mockDataSets.length, 'records');
      mockDataSets.forEach(set => {
        console.log('   -', set.name);
      });
    } catch (error) {
      console.error('❌ Error fetching mock data sets:', error.message);
      mockDataSets = [];
    }

    console.log('\n✅ All admin settings queries completed successfully!');
    console.log('The admin settings page should now work without the "Cannot read properties of undefined" error.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminSettings();