/**
 * Unauthorized Page
 * Displayed when a user tries to access a page they don't have permission for
 */

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function UnauthorizedPage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m0 0V6m0 2h2m-2 0H9"
              />
            </svg>
          </div>
          
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            You don't have permission to access this page. If you believe this is an error, please contact your administrator.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
            <Link
              href="/dashboard"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/error-recovery"
              className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Fix Session
            </Link>
            
            <Link
              href="/"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}