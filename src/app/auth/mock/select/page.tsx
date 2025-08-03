/**
 * Mock User Selection Page
 * 
 * This page allows developers to select a mock user for authentication
 * during development.
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMockUsers } from '@/lib/mock/mock-users';
import Image from 'next/image';

export default function MockUserSelect() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  useEffect(() => {
    // Get the list of mock users
    const mockUsers = getMockUsers();
    setUsers(mockUsers);
    console.log('Mock users loaded:', mockUsers);
  }, []);
  
  const handleSelectUser = async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting to sign in with mock user:', userId);
      
      // Sign in with the selected user
      const result = await signIn('mock-github', {
        userId: userId.toString(),
        redirect: false, // Don't redirect automatically
        callbackUrl
      });
      
      console.log('Sign-in result:', result);
      
      // If sign-in is successful, redirect manually
      if (result?.ok) {
        console.log('Sign-in successful, redirecting to:', callbackUrl);
        router.push(callbackUrl);
      } else {
        console.error('Failed to sign in with mock user:', result?.error);
        setError(result?.error || 'Failed to sign in');
      }
    } catch (error) {
      console.error('Error signing in with mock user:', error);
      setError('An error occurred during sign-in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Select a Mock User</h1>
        <p className="mb-6 text-gray-600 text-center">
          This is a development feature. Select a user to sign in without real GitHub authentication.
        </p>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user: any) => (
            <div 
              key={user.id}
              className={`border rounded-lg p-4 flex items-center cursor-pointer hover:bg-gray-50 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => !isLoading && handleSelectUser(user.id)}
            >
              <div className="flex-shrink-0 mr-4">
                <Image
                  src={user.avatar_url}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.login}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}