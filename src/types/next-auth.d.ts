/**
 * NextAuth.js Type Extensions
 * Extends the default NextAuth types with custom properties
 */

import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken: string;
    error?: string;
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    githubId: number;
    username: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    accessToken: string;
    refreshToken?: string | null;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    userId?: string;
    accessToken?: string;
    refreshToken?: string | null;
    error?: string;
  }
}