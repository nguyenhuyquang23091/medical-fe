"use client"

import { Suspense, ReactNode } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { UserProfileProvider } from '@/app/context/UserProfileContext';
import { PageLoadingSkeleton } from '@/components/ui/profile-loading-skeleton';

interface AuthenticatedAppProps {
  children: ReactNode;
}

export function AuthenticatedApp({ children }: AuthenticatedAppProps) {
  const { isLoggedIn, status } = useAuth();

  // Don't wrap with Suspense for guest users or during loading
  if (!isLoggedIn || status === 'loading') {
    return (
      <UserProfileProvider>
        {children}
      </UserProfileProvider>
    );
  }

  // For authenticated users, wrap with Suspense to handle profile loading
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <UserProfileProvider>
        {children}
      </UserProfileProvider>
    </Suspense>
  );
}