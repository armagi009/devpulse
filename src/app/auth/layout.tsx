import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | DevPulse',
  description: 'Sign in to DevPulse to access your development analytics dashboard.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}