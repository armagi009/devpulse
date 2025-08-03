/**
 * System Settings Page
 * Allows administrators to configure system settings
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-config';
import { checkPermission } from '@/lib/auth/role-service';
import { PERMISSIONS } from '@/lib/types/roles';
import { prisma } from '@/lib/db/prisma';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SystemSettingsForm from '@/components/admin/SystemSettingsForm';
import AppModeSettings from '@/components/admin/AppModeSettings';

/**
 * System Settings Page
 */
export default async function SystemSettingsPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Check if user has permission to access admin features
  const hasPermission = await checkPermission(PERMISSIONS.ADMIN_SYSTEM);
  
  if (!hasPermission) {
    redirect('/unauthorized');
  }
  
  // Get system settings with error handling
  let systemSettings: any[] = [];
  let appMode: any = null;
  let mockDataSets: any[] = [];

  try {
    systemSettings = await prisma.systemSettings.findMany();
  } catch (error) {
    console.error('Error fetching system settings:', error);
    systemSettings = [];
  }

  try {
    appMode = await prisma.appMode.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching app mode:', error);
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
  } catch (error) {
    console.error('Error fetching mock data sets:', error);
    mockDataSets = [];
  }
  
  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        </div>
        
        {/* General Settings */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">General Settings</h2>
          <SystemSettingsForm settings={systemSettings} />
        </Card>
        
        {/* App Mode Settings */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Application Mode</h2>
          <AppModeSettings appMode={appMode} mockDataSets={mockDataSets} />
        </Card>
        
        {/* Security Settings */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Security Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  defaultValue="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Policy
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  defaultValue="standard"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="strict">Strict</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="enable-2fa"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                defaultChecked
              />
              <label htmlFor="enable-2fa" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable Two-Factor Authentication
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="enforce-2fa"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              />
              <label htmlFor="enforce-2fa" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enforce Two-Factor Authentication for All Users
              </label>
            </div>
            
            <div className="pt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Security Settings
              </button>
            </div>
          </div>
        </Card>
        
        {/* Database Settings */}
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-medium mb-4">Database Management</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Database Size</h3>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">245 MB</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Records</h3>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">12,458</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Backup</h3>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">2 hours ago</p>
              </div>
            </div>
            
            <div className="pt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Backup
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Optimize Database
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Run Migrations
              </button>
            </div>
          </div>
        </Card>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            These settings affect the entire application. Please be careful when making changes,
            as they may impact all users and data in the system.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}