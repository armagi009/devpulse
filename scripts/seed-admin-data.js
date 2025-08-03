/**
 * Seed script to create default admin data
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAdminData() {
  try {
    console.log('Seeding admin data...');

    // Create default system settings
    const systemSettings = [
      {
        key: 'app_name',
        value: 'DevPulse',
        description: 'Application name displayed in the UI',
        isEncrypted: false,
      },
      {
        key: 'max_repositories_per_user',
        value: '10',
        description: 'Maximum number of repositories a user can connect',
        isEncrypted: false,
      },
      {
        key: 'data_retention_days',
        value: '365',
        description: 'Number of days to retain user data',
        isEncrypted: false,
      },
      {
        key: 'enable_analytics',
        value: 'true',
        description: 'Enable analytics and tracking features',
        isEncrypted: false,
      },
    ];

    for (const setting of systemSettings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      });
      console.log(`✅ Created/updated system setting: ${setting.key}`);
    }

    // Create default app mode
    const appMode = await prisma.appMode.upsert({
      where: { id: 'default' },
      update: {
        mode: 'LIVE',
        enabledFeatures: ['analytics', 'burnout_detection', 'team_insights'],
        errorSimulation: null,
      },
      create: {
        id: 'default',
        mode: 'LIVE',
        enabledFeatures: ['analytics', 'burnout_detection', 'team_insights'],
        errorSimulation: null,
      },
    });
    console.log('✅ Created/updated app mode:', appMode.mode);

    // Create a default mock data set
    const mockDataSet = await prisma.mockDataSet.upsert({
      where: { name: 'Default Demo Data' },
      update: {
        data: JSON.stringify({
          users: 5,
          repositories: 3,
          commits: 100,
          pullRequests: 25,
          issues: 15,
        }),
      },
      create: {
        name: 'Default Demo Data',
        data: JSON.stringify({
          users: 5,
          repositories: 3,
          commits: 100,
          pullRequests: 25,
          issues: 15,
        }),
      },
    });
    console.log('✅ Created/updated mock data set:', mockDataSet.name);

    console.log('✅ Admin data seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminData();