'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authClient, getSession, isAuthBypassEnabled, getCurrentUser } from '@/lib/auth';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<{ success: boolean; error?: string }>;
    refetch: () => Promise<void>;
    updateProfile: (data: { name: string }) => Promise<{ success: boolean; error?: string }>;
    changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
    });

    const checkAuth = useCallback(async () => {
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

            // Better Auth response structure: { data: { session, user }, error: null }
            // OR: { session, user } (direct)
            const session: any = sessionResult?.data || sessionResult;

            // Check for valid session structure
            const hasValidSession = !!(session &&
                typeof session === 'object' &&
                'user' in session &&
                session.user &&
                typeof session.user === 'object' &&
                session.user.id);

            if (hasValidSession) {
                setState({
                    user: {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.name || 'User',
                        createdAt: session.user.createdAt,
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
    }, []);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const signIn = useCallback(async (email: string, password: string) => {
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

            // Call checkAuth to update state
            await checkAuth();
            toast.success('Welcome back!');

            return { success: true };
        } catch (error) {
            const errorMessage = (error as Error).message;
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [checkAuth]);

    const signUp = useCallback(async (name: string, email: string, password: string) => {
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
    }, [checkAuth]);

    const signOut = useCallback(async () => {
        // If bypass is enabled, just reset state (no actual logout)
        if (isAuthBypassEnabled()) {
            setState({
                user: null,
                loading: false,
                error: null,
                isAuthenticated: false,
            });
            toast.info('Logged out');
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
            toast.info('Logged out');
            return { success: true };
        } catch (error) {
            const errorMessage = (error as Error).message;
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const updateProfile = useCallback(async (data: { name: string }) => {
        if (!state.user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check for session expiration before making request
        if (!isAuthBypassEnabled() && !state.isAuthenticated) {
            return { success: false, error: 'Session expired. Please sign in again.' };
        }

        try {
            // Use Better Auth's updateUser method to update the user's name
            const result = await authClient.updateUser({
                name: data.name,
            });

            if (result.error) {
                throw new Error(result.error.message || 'Failed to update profile');
            }

            // Update local state with the new name
            setState(prev => ({
                ...prev,
                user: prev.user ? {
                    ...prev.user,
                    name: data.name,
                } : null,
            }));

            return { success: true };
        } catch (error) {
            const errorMessage = (error as Error).message;

            // Handle specific error cases
            if (errorMessage.includes('Session expired') || errorMessage.includes('User not found') || errorMessage.includes('Unauthorized')) {
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
    }, [state.user, state.isAuthenticated]);

    const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }) => {
        if (!state.user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Check for session expiration before making request
        if (!isAuthBypassEnabled() && !state.isAuthenticated) {
            return { success: false, error: 'Session expired. Please sign in again.' };
        }

        try {
            // Use Better Auth's changePassword method
            const result = await authClient.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });

            if (result.error) {
                throw new Error(result.error.message || 'Failed to change password');
            }

            toast.success('Password changed successfully');
            return { success: true };
        } catch (error) {
            const errorMessage = (error as Error).message;

            // Handle specific error cases
            if (errorMessage.includes('Session expired') || errorMessage.includes('User not found') || errorMessage.includes('Unauthorized')) {
                // Force sign out on session issues
                setState({
                    user: null,
                    loading: false,
                    error: null,
                    isAuthenticated: false,
                });
                toast.error('Session expired. Please sign in again.');
                return { success: false, error: 'Session expired. Please sign in again.' };
            }

            // Handle incorrect current password
            if (errorMessage.includes('incorrect') || errorMessage.includes('Invalid')) {
                toast.error('Current password is incorrect');
                return { success: false, error: 'Current password is incorrect' };
            }

            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, [state.user, state.isAuthenticated]);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<AuthContextType>(() => ({
        ...state,
        signIn,
        signUp,
        signOut,
        refetch: checkAuth,
        updateProfile,
        changePassword,
    }), [state, signIn, signUp, signOut, checkAuth, updateProfile, changePassword]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
