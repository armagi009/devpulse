'use client';

/**
 * RoleBasedDashboardRouter Component
 * Routes users to their appropriate dashboard based on their role
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { UserRole } from '@/lib/types/roles';

interface RoleBasedDashboardRouterProps {
  userRole?: UserRole;
}

export default function RoleBasedDashboardRouter({ userRole }: RoleBasedDashboardRouterProps) {
  const router = useRouter();
  const { hasRole } = usePermissions();
  
  useEffect(() => {
    // Redirect based on role
    if (hasRole(UserRole.ADMINISTRATOR)) {
      router.push('/dashboard/admin');
    } else if (hasRole(UserRole.TEAM_LEAD)) {
      router.push('/dashboard/team-lead');
    } else {
      router.push('/dashboard/developer');
    }
  }, [router, hasRole, userRole]);
  
  // Return null as this is just a router component
  return null;
}