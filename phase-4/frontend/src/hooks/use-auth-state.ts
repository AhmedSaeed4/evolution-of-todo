// Auth State Hook - Client-side authentication state management
'use client';

import { useAuthContext } from '@/contexts/AuthContext';

export interface UserState {
  authenticated: boolean;
  user?: {
    name: string;
    email: string;
  };
}

export interface UseAuthStateReturn {
  session: UserState | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to manage authentication state for homepage components
 * Uses existing AuthContext and provides clean interface for conditional rendering
 */
export function useAuthState(): UseAuthStateReturn {
  const authContext = useAuthContext();

  // Transform context to our interface
  const transformedSession: UserState | null = authContext.isAuthenticated && authContext.user ? {
    authenticated: true,
    user: {
      name: authContext.user.name,
      email: authContext.user.email
    }
  } : null;

  return {
    session: transformedSession,
    isLoading: authContext.loading,
    error: authContext.error ? new Error(authContext.error) : null
  };
}