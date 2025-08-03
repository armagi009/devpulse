'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function ErrorRecoveryPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  const handleClearSession = async () => {
    try {
      setIsSigningOut(true)
      // Clear local storage and session storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Clear cookies by setting them to expire
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
      
      // Sign out and redirect
      await signOut({ callbackUrl: '/auth/signin' })
    } catch (err) {
      console.error('Error clearing session:', err)
      setError('Failed to clear session. Please try again.')
      setIsSigningOut(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <svg
            className="mb-4 h-16 w-16 text-yellow-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Session Recovery
          </h1>
          
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            Experiencing issues with your session? Use the options below to recover.
          </p>
          
          {error && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-300">
              {error}
            </div>
          )}
          
          <div className="flex w-full flex-col space-y-3">
            {!isSigningOut ? (
              <>
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Sign Out
                </button>
                
                <button
                  onClick={handleClearSession}
                  className="w-full rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                >
                  Clear Session & Sign Out
                </button>
                
                <Link
                  href="/"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Return to Dashboard
                </Link>
              </>
            ) : (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="ml-2">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 max-w-md space-y-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <div>
          <h2 className="mb-2 font-semibold">Common Issues</h2>
          <ul className="list-disc space-y-1 text-left pl-5">
            <li>Session timeout or expiration</li>
            <li>Permission changes while logged in</li>
            <li>Browser cache conflicts</li>
            <li>Authentication token issues</li>
          </ul>
        </div>
        
        <div>
          <h2 className="mb-2 font-semibold">Additional Troubleshooting</h2>
          <ul className="list-disc space-y-1 text-left pl-5">
            <li>Try using a different browser</li>
            <li>Clear your browser cache and cookies</li>
            <li>Check if your account permissions have changed</li>
            <li>Contact your administrator if issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  )
}