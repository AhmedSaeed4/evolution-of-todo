// Better Auth API Route Handler
// Handles all authentication endpoints

import { auth } from '@/lib/auth-server';

export const GET = auth.handler;
export const POST = auth.handler;
