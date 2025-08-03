'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0 && !isSigningOut) {
      handleSignOut()
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown, isSigningOut])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({ callbackUrl: '/' })
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out. Please try again.')
      setIsSigningOut(false)
    }
  }

  const handleManualSignOut = () => {
    setCountdown(0)
    handleSignOut()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <svg
            className="mb-4 h-16 w-16 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Sign Out
          </h1>
          
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
            {isSigningOut
              ? 'Signing you out...'
              : `You will be signed out in ${countdown} seconds. This will clear your current session.`}
          </p>
          
          {error && (
            <div className="mb-4 w-full rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/50 dark:text-red-300">
              {error}
            </div>
          )}
          
          <div className="flex w-full flex-col space-y-3">
            {!isSigningOut && (
              <>
                <button
                  onClick={handleManualSignOut}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
                  disabled={isSigningOut}
                >
                  Sign Out Now
                </button>
                
                <Link
                  href="/"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </Link>
              </>
            )}
            
            {isSigningOut && (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="ml-2">Signing out...</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Having trouble? Try clearing your browser cache and cookies.
        </p>
        <p className="mt-2">
          <Link href="/auth/signin" className="text-blue-600 hover:underline dark:text-blue-400">
            Return to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}