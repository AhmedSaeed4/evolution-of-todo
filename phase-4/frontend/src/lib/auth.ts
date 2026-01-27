// Better Auth configuration for Next.js 16+ App Router
// This file sets up the authentication client

import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

// Mock user for bypass mode
const MOCK_USER = {
  id: 'bypass-user',
  email: 'bypass@example.com',
  name: 'Bypass User',
  createdAt: new Date().toISOString()
};

// Auth client instance with JWT plugin for FastAPI integration
// JWT tokens will be sent to FastAPI backend for authentication
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

// Helper to get JWT token for API requests
export async function getAuthToken(): Promise<string | null> {
  if (isAuthBypassEnabled()) {
    // In bypass mode, we generate a JWT-like token for the backend
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    }));
    return `${header}.${payload}.bypass-signature`;
  }

  try {
    // Use the JWT plugin's token() method to get a signed JWT
    // jwtClient adds token() method directly to authClient
    const tokenResult = await (authClient as any).token();

    if (tokenResult?.data?.token) {
      return tokenResult.data.token;
    }
    if (tokenResult?.token) {
      return tokenResult.token;
    }

    return null;
  } catch (error) {
    return null;
  }
}
