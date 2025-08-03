/**
 * NextAuth type extensions
 */

import { UserRole } from './roles';

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
      role?: UserRole;
    };
    accessToken?: string;
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    userId?: string;
    role?: UserRole;
    accessToken?: string;
    refreshToken?: string;
  }
}