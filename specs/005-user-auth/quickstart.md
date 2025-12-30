# Quickstart: Better Auth Server Integration

**Feature**: 005-user-auth
**Date**: 2025-12-30
**Estimated Time**: 1-2 hours

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Access to Neon PostgreSQL database
- ✅ Existing Next.js 16+ project (frontend)
- ✅ Better Auth v1.4.9 already installed

---

## Step 1: Environment Setup

### 1.1 Generate Secure Secret

```bash
# Generate a 64+ character random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** - you'll need it for the next step.

### 1.2 Update Environment Variables

Edit `phase-2/frontend/.env.local`:

```env
# Existing
NEXT_PUBLIC_AUTH_BYPASS=true

# Add these
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
BETTER_AUTH_SECRET=your-generated-secret-from-step-1.1
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
```

**Important**:
- Replace with your actual Neon PostgreSQL connection string
- Use the secret you just generated
- Keep `NEXT_PUBLIC_AUTH_BYPASS=true` for now (we'll disable later)

---

## Step 2: Install Dependencies

```bash
cd phase-2/frontend
npm install pg
```

**Verify installation**:
```bash
npm list pg
```

---

## Step 3: Create Better Auth Server

### 3.1 Create Server Configuration

Create `phase-2/frontend/src/lib/auth-server.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { postgresql } from 'better-auth/adapters/postgresql';
import { jwt } from 'better-auth/plugins/jwt';
import { pg } from 'pg';

export const auth = betterAuth({
  database: postgresql({
    url: process.env.DATABASE_URL!,
    ssl: true, // Required for Neon
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  plugins: [jwt()],
});
```

### 3.2 Create API Route Handler

Create `phase-2/frontend/src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from '@/lib/auth-server';

export const GET = auth.handler;
export const POST = auth.handler;
```

---

## Step 4: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
✓ Ready in 3.2s
✓ Compiled successfully
```

**Check for errors**:
- Database connection errors → verify `DATABASE_URL`
- Missing secret → verify `BETTER_AUTH_SECRET`
- Port conflicts → stop other services on port 3000

---

## Step 5: Test Registration

### 5.1 Navigate to Signup

Open browser: `http://localhost:3000/signup`

### 5.2 Create Test Account

Fill the form:
- **Name**: Test User
- **Email**: test@example.com
- **Password**: testpassword123

### 5.3 Verify Success

**Expected**:
- Redirect to `/tasks`
- User avatar/name displayed
- No errors in browser console

**Verify Database**:
```sql
SELECT * FROM user WHERE email = 'test@example.com';
```

Should see new user record with hashed password.

---

## Step 6: Test Login

### 6.1 Logout First

Click logout button or navigate to `/login`

### 6.2 Login with Test Account

Fill the form:
- **Email**: test@example.com
- **Password**: testpassword123

### 6.3 Verify Success

**Expected**:
- Redirect to `/tasks`
- User session active
- Page refresh keeps user logged in

---

## Step 7: Test Session Persistence

### 7.1 While Logged In

Refresh the page (F5 or Ctrl+R)

### 7.2 Verify

**Expected**:
- User remains logged in
- No redirect to login page
- User data still displayed

### 7.3 Close and Reopen Browser

Close browser completely, then reopen and navigate to `http://localhost:3000`

**Expected**:
- User should still be logged in (session persists)

---

## Step 8: Test Logout

### 8.1 Click Logout

While logged in, click the logout button

### 8.2 Verify

**Expected**:
- Redirect to `/login`
- Session cleared
- Cannot access `/tasks` without logging in again

---

## Step 9: Verify Database Tables

### 9.1 Check User Table

```sql
SELECT id, email, name, emailVerified, createdAt FROM user;
```

**Should see**:
- Your test user
- Hashed password (not visible in this query)
- Timestamps

### 9.2 Check Session Table

```sql
SELECT id, userId, expiresAt FROM session;
```

**Should see**:
- Active session for your user
- Future expiration timestamp

---

## Step 10: Disable Bypass Mode

### 10.1 Update Environment

Edit `phase-2/frontend/.env.local`:

```env
NEXT_PUBLIC_AUTH_BYPASS=false  # Change from true to false
```

### 10.2 Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 10.3 Test End-to-End

Repeat steps 5-8 to verify everything works with real auth.

---

## Step 11: Backend Integration Test

### 11.1 Get JWT Token

While logged in, open browser DevTools → Application → Cookies

Copy the `better-auth.session_token` value

### 11.2 Test with FastAPI

Make a request to your FastAPI backend:

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected**:
- Backend successfully validates token
- Returns user-specific tasks
- No authentication errors

---

## Troubleshooting

### Issue: Database Connection Failed

**Error**: `connection refused` or `SSL error`

**Solution**:
```bash
# Test connection
psql "$DATABASE_URL"

# Verify SSL mode
echo $DATABASE_URL | grep sslmode
```

### Issue: Secret Too Short

**Error**: `secret must be at least 32 characters`

**Solution**: Regenerate secret with step 1.1

### Issue: Port Already in Use

**Error**: `EADDRINUSE`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Issue: Bypass Mode Still Active

**Symptom**: No real auth happening, always logged in

**Solution**:
- Verify `.env.local` has `NEXT_PUBLIC_AUTH_BYPASS=false`
- Restart dev server
- Clear browser cookies

---

## Success Checklist

- [ ] `pg` dependency installed
- [ ] Environment variables configured
- [ ] `auth-server.ts` created
- [ ] API route handler created
- [ ] Dev server starts without errors
- [ ] User registration works
- [ ] User login works
- [ ] Session persists across refreshes
- [ ] Logout works
- [ ] Database tables created
- [ ] Bypass mode disabled
- [ ] Backend can validate JWT tokens

---

## Next Steps

### Immediate
1. **Test with real users**: Invite a few users to test
2. **Monitor logs**: Check for authentication errors
3. **Performance**: Monitor response times

### Short-term
1. **Email verification**: Add email verification flow
2. **Password reset**: Implement password reset functionality
3. **OAuth providers**: Add Google/GitHub login

### Long-term
1. **Rate limiting**: Protect against brute force
2. **2FA**: Add two-factor authentication
3. **Session management**: User session dashboard

---

## Quick Commands Reference

```bash
# Install dependency
npm install pg

# Start dev server
npm run dev

# Check database
psql "$DATABASE_URL"

# View logs
tail -f phase-2/frontend/.next/server/logs/*.log
```

---

## Support

**If you encounter issues**:

1. Check `.env.local` configuration
2. Verify database connection string
3. Review browser console errors
4. Check server logs
5. Verify dependency installation

**Rollback**: If needed, set `NEXT_PUBLIC_AUTH_BYPASS=true` to restore bypass mode.

---

**Status**: ✅ Ready for Implementation

This quickstart provides everything needed to implement Better Auth Server integration successfully.