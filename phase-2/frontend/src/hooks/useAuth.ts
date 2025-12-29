import { useState, useEffect } from 'react';
import { authClient, getSession, isAuthBypassEnabled, getCurrentUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
  updateProfile: (data: { name: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if auth bypass is enabled
      if (isAuthBypassEnabled()) {
        const mockUser = await getCurrentUser();
        setState({
          user: mockUser ? {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            createdAt: mockUser.createdAt,
          } : null,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return;
      }

      const sessionResult = await getSession();
      // Handle Better Auth response type - check for data property or direct access
      const session: any = sessionResult?.data || sessionResult;

      // Type guard to check if session has user
      const hasUser = session && typeof session === 'object' && 'user' in session &&
        session.user && typeof session.user === 'object';

      if (hasUser) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name || 'User',
          },
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: 'Failed to check authentication',
        isAuthenticated: false,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    // If bypass is enabled, auto-authenticate with mock user
    if (isAuthBypassEnabled()) {
      await checkAuth();
      return { success: true };
    }

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    // If bypass is enabled, auto-authenticate with mock user
    if (isAuthBypassEnabled()) {
      await checkAuth();
      return { success: true };
    }

    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    // If bypass is enabled, just reset state (no actual logout)
    if (isAuthBypassEnabled()) {
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      return { success: true };
    }

    try {
      await authClient.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateProfile = async (data: { name: string }) => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check for session expiration before making request
    if (!isAuthBypassEnabled() && !state.isAuthenticated) {
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    try {
      const updatedUser = await api.updateProfile(state.user.id, data);
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Handle specific error cases
      if (errorMessage.includes('Session expired') || errorMessage.includes('User not found')) {
        // Force sign out on session issues
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
        return { success: false, error: 'Session expired. Please sign in again.' };
      }

      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check for session expiration before making request
    if (!isAuthBypassEnabled() && !state.isAuthenticated) {
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    try {
      await api.changePassword(state.user.id, data);
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;

      // Handle specific error cases
      if (errorMessage.includes('Session expired') || errorMessage.includes('User not found')) {
        // Force sign out on session issues
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
        return { success: false, error: 'Session expired. Please sign in again.' };
      }

      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refetch: checkAuth,
    updateProfile,
    changePassword,
  };
}
