/**
 * Repository Selection Onboarding Page
 * Allows users to select repositories for analysis
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-config';
import RepositorySetupWizard from '@/components/github/RepositorySetupWizard';

export default async function RepositoriesPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Connect Your Repositories</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select the repositories you want to analyze. DevPulse will use this data to provide insights
            about your team's performance and health.
          </p>
        </div>
        
        <RepositorySetupWizard 
          onComplete={() => redirect('/onboarding/complete')}
        />
      </div>
    </div>
  );
}