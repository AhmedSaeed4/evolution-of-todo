// Better Auth configuration for Next.js 16+ App Router
// This file sets up the authentication client with JWT support

import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

// Mock user for bypass mode
const MOCK_USER = {
  id: 'bypass-user',
  email: 'bypass@example.com',
  name: 'Bypass User'
};

// Auth client instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  plugins: [jwtClient()]
});

// Export auth methods
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const getSession = authClient.getSession;

// Helper function to check if auth bypass is enabled
export function isAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
}

// Helper function to check authentication status
export async function requireAuth() {
  // If bypass is enabled, always return success
  if (isAuthBypassEnabled()) {
    return { user: MOCK_USER };
  }

  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

// Helper to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  // If bypass is enabled, return mock user ID
  if (isAuthBypassEnabled()) {
    return MOCK_USER.id;
  }

  const sessionResult = await getSession();
  const session: any = sessionResult?.data || sessionResult;
  return session?.user?.id || null;
}

// Helper to get current user (for bypass mode)
export async function getCurrentUser(): Promise<any> {
  if (isAuthBypassEnabled()) {
    return MOCK_USER;
  }

  const sessionResult = await getSession();
  const session: any = sessionResult?.data || sessionResult;
  return session?.user || null;
}

// Helper to check if user is authenticated (for bypass mode)
export async function isAuthenticated(): Promise<boolean> {
  if (isAuthBypassEnabled()) {
    return true;
  }

  const session = await getSession();
  return !!session;
}
