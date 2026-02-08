// Better Auth Server Configuration
// Handles user authentication with Neon PostgreSQL

import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins/jwt';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
// Note: Neon requires SSL, connection string already includes sslmode=require
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
    // Required for Neon connections
  },
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Pool error handling for debugging
pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
});

// Test connection on startup
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') console.log('✅ Database connected successfully');
});

// JWT plugin enabled for FastAPI backend integration
// FastAPI will verify JWT tokens to authenticate API requests
export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  plugins: [jwt()],
});
