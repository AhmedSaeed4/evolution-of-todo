# Evolution of Todo - Frontend (Phase 2)

> Modern Next.js web frontend with Spec-Driven Development framework

## 🚀 Project Overview

This is the **Phase 2** frontend application built with Next.js 16+, featuring:

- **App Router Architecture** with TypeScript
- **Modern Technical Editorial Design System**
- **Framer Motion Animations**
- **Production Authentication** with Better Auth + Neon PostgreSQL
- **Profile Management System** with comprehensive user settings
- **Task Management** with full CRUD operations
- **JWT Integration** ready for FastAPI backend

## 🎯 Current Feature: Authentication System (005-user-auth) ✅

### ✅ Authentication System Features

1. **Better Auth Server Configuration** (`src/lib/auth-server.ts`)
   - PostgreSQL adapter with Neon database
   - JWT plugin for token generation
   - Email/password authentication
   - SSL connection support
   - Automatic session management

2. **API Route Handler** (`src/app/api/auth/[...all]/route.ts`)
   - Single file handles all auth endpoints
   - RESTful API design
   - Cookie-based session management
   - Automatic endpoint generation

3. **Working API Endpoints**
   - **Registration**: `POST /api/auth/sign-up/email`
     - Email validation
     - Password minimum 8 chars
     - Duplicate email prevention
     - Returns JWT token immediately
   - **Login**: `POST /api/auth/sign-in/email`
     - Credential verification
     - Generic error messages (security)
     - Session creation
     - JWT token issuance
   - **Session**: `GET /api/auth/get-session`
     - Cookie validation
     - User data retrieval
     - Session persistence

4. **Security Features**
   - **bcrypt hashing** for passwords
   - **Constant-time comparison** (timing attack prevention)
   - **JWT tokens** (HS256 algorithm)
   - **Generic error messages** (prevents user enumeration)
   - **SSL connections** to Neon PostgreSQL

5. **Backend Integration Ready**
   - JWT format: `header.payload.signature`
   - Payload: `sub` (user_id), `email`, `name`, `iat`, `exp`
   - Shared secret: `BETTER_AUTH_SECRET`
   - User isolation via `user_id` for multi-tenancy

6. **Client Integration** (`src/lib/auth.ts`)
   - Auth client with JWT plugin
   - Helper functions for session management
   - Bypass mode support for testing
   - Ready for frontend UI integration

### 🎨 Design System Integration

**Typography:**
- **Serif**: Playfair Display (headings)
- **Sans**: DM Sans (body text)
- **Mono**: JetBrains Mono (labels, data)

**Colors:**
- **Background**: #F9F7F2 (Cream)
- **Accent**: #FF6B4A (Vibrant Orange)
- **Structure**: #2A1B12/10 (Technical lines)

**Animations:**
- Framer Motion with staggered entrances
- Smooth eased transitions
- Hover scale effects (1.02x)

## 🏗️ Architecture

### File Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/      # Protected routes
│   │   ├── layout.tsx
│   │   ├── tasks/page.tsx
│   │   └── profile/page.tsx
│   ├── api/              # API routes
│   │   └── auth/         # Authentication endpoints
│   │       └── [...all]/ # Better Auth handler
│   │           └── route.ts
│   ├── page.tsx          # Landing page
│   └── layout.tsx        # Root layout
├── components/
│   ├── profile/          # Profile management
│   │   ├── ProfileInfoCard.tsx
│   │   ├── PasswordChangeCard.tsx
│   │   ├── AccountInfoCard.tsx
│   │   ├── TaskStatsCard.tsx
│   │   └── DangerZoneCard.tsx
│   ├── tasks/            # Task management
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskFilters.tsx
│   │   └── TaskSearch.tsx
│   ├── auth/             # Auth components
│   │   └── ProtectedRoute.tsx
│   ├── layout/           # Layout components
│   │   └── Navbar.tsx
│   └── ui/               # Reusable UI
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Checkbox.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── Badge.tsx
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useTasks.ts
│   └── useFilters.ts
├── lib/                  # Utilities & Auth
│   ├── auth.ts           # Client auth config
│   ├── auth-server.ts    # Better Auth server ⭐ NEW
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
└── motion/               # Animations
    └── variants.ts       # Framer Motion variants
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Neon PostgreSQL database (for real authentication)

### Installation

```bash
# Navigate to frontend directory
cd phase-2/frontend

# Install dependencies (includes pg for database)
npm install

# Set up authentication environment
# Generate secure secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
cat > .env.local << EOF
NEXT_PUBLIC_AUTH_BYPASS=false
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
BETTER_AUTH_SECRET=your-generated-64-char-secret
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
EOF

# Run development server
npm run dev
```

### Quick Start

**Real Authentication Mode:**
1. **Visit**: http://localhost:3000
2. **Signup**: Navigate to `/signup` and create account
3. **Login**: Use credentials to authenticate
4. **Session**: Access `/tasks` and `/profile` with valid session

**Bypass Mode (for testing):**
```bash
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local
npm run dev
# Visit http://localhost:3000 - instant access to all features

## 🔐 Real Authentication Testing

### API Endpoint Testing

```bash
# Start server (with real auth enabled)
npm run dev

# Test registration
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpassword123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"testpassword123"}'

# Test session validation
curl http://localhost:3000/api/auth/get-session \
  -b cookies.txt

# Test error scenarios
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"test@example.com","password":"short"}'
```

### Expected Results

**Registration:**
- ✅ Success: HTTP 200 with user + token
- ❌ Duplicate: HTTP 422 with error message
- ❌ Weak password: HTTP 400 with validation error
- ❌ Invalid email: HTTP 400 with validation error

**Login:**
- ✅ Success: HTTP 200 with user + token
- ❌ Wrong credentials: HTTP 401 (generic error)

**Session:**
- ✅ Valid: HTTP 200 with user data
- ❌ Invalid: HTTP 401 or null user

### Database Verification

```sql
-- Check user table
SELECT id, email, name, createdAt FROM user;

-- Check session table
SELECT id, userId, expiresAt FROM session;

-- Verify password hashing (should show bcrypt hash)
SELECT email, passwordHash FROM user WHERE email = 'test@example.com';
```

## 🔧 Authentication Bypass

### Enable Bypass Mode

```bash
# Enable bypass
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local

# Start dev server
npm run dev
```

### Features in Bypass Mode

- ✅ **Instant access** to all routes
- ✅ **Mock user** system
- ✅ **Visual indicator** "(Bypass)" in navbar
- ✅ **Full functionality** without backend
- ✅ **Profile management** with local state

### Safety Features

- **Default**: Disabled (`false`)
- **Visual indicators**: Bypass badge in UI
- **Environment only**: No code changes required
- **Production safe**: Cannot be enabled accidentally

## 📊 Pages & Routes

### Public Routes
- `/` - Landing page with project info
- `/login` - Login form (disabled in bypass)
- `/signup` - Signup form (disabled in bypass)

### Protected Routes (with bypass support)
- `/tasks` - Task management dashboard
- `/profile` - Profile settings page

### Development Routes
- `/test` - Component testing playground

## 🧪 Testing

### Real Authentication Testing

```bash
# Enable real authentication
echo "NEXT_PUBLIC_AUTH_BYPASS=false" > .env.local
# Ensure DATABASE_URL and BETTER_AUTH_SECRET are set

# Start development server
npm run dev

# Test checklist:
# ✅ Visit http://localhost:3000 - should show login page
# ✅ Navigate to /signup - create new account
# ✅ Register with valid credentials - should redirect to /tasks
# ✅ Logout and login again - session should persist
# ✅ Test error scenarios (duplicate email, weak password)
# ✅ Check database for user and session records
```

### API Testing (curl)

```bash
# Test all endpoints programmatically
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test","email":"api@test.com","password":"apitest123"}'

# Verify registration worked
curl http://localhost:3000/api/auth/get-session \
  -b "better-auth.session_token=YOUR_TOKEN"
```

### Bypass Mode Testing

```bash
# Enable bypass mode
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local

# Start development server
npm run dev

# Test checklist:
# ✅ Visit http://localhost:3000 - should redirect to /tasks
# ✅ Check navbar shows "(Bypass)" indicator
# ✅ Navigate to /profile - should load with mock user
# ✅ Test profile form validation and submission
# ✅ Test password change form
# ✅ Test all profile components
```

### Component Testing

```bash
# Run development server
npm run dev

# Visit test page
# http://localhost:3000/test
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔗 Related Documentation

- **Main Project**: [../../README.md](../../README.md)
- **Spec 005**: [../../specs/005-user-auth/spec.md](../../specs/005-user-auth/spec.md) - Authentication specification
- **Auth Quickstart**: [../../specs/005-user-auth/quickstart.md](../../specs/005-user-auth/quickstart.md) - Complete setup guide
- **API Contracts**: [../../specs/005-user-auth/contracts/auth-api.md](../../specs/005-user-auth/contracts/auth-api.md) - RESTful endpoints
- **Data Model**: [../../specs/005-user-auth/data-model.md](../../specs/005-user-auth/data-model.md) - Database schema
- **Spec 004**: [../../specs/004-profile-editing/spec.md](../../specs/004-profile-editing/spec.md) - Profile management
- **Auth Bypass**: [../../phase-2/AUTH_BYPASS_IMPLEMENTATION.md](../../phase-2/AUTH_BYPASS_IMPLEMENTATION.md) - Bypass feature docs
- **Design System**: [../../../.claude/skills/ui-design/TOKENS.md](../../../.claude/skills/ui-design/TOKENS.md) - Design tokens

## 🎯 Key Features

### Authentication System ✅
- ✅ **User Registration** - Email/password signup with validation
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Session Management** - Persistent sessions via cookies
- ✅ **Password Security** - bcrypt hashing, constant-time comparison
- ✅ **JWT Integration** - Ready for FastAPI backend validation
- ✅ **API Endpoints** - `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/get-session`
- ✅ **Database Integration** - Neon PostgreSQL with SSL
- ✅ **Error Handling** - Generic messages prevent user enumeration

### Profile Management
- ✅ Editable profile information
- ✅ Secure password changes
- ✅ Account information display
- ✅ Task statistics dashboard
- ✅ Account deletion with confirmation

### Task Management
- ✅ Create tasks with title and description
- ✅ Complete/uncomplete tasks
- ✅ Edit task details
- ✅ Delete tasks
- ✅ Filter and search tasks

### UI/UX
- ✅ Modern Technical Editorial design
- ✅ Smooth animations and transitions
- ✅ Responsive mobile-first layout
- ✅ Accessibility features
- ✅ Loading states and error handling

## 📦 Dependencies

**Core:**
- Next.js 16.1.1 (App Router)
- React 19.2.3
- TypeScript 5.x

**Authentication:**
- Better Auth v1.4.9 (authentication framework)
- pg v8.16.3 (PostgreSQL driver for Neon)
- @types/pg v8.16.0 (TypeScript types)

**UI & Animations:**
- Framer Motion v12.23.26 (animations)
- Lucide React v0.562.0 (icons)
- Tailwind CSS v4 (styling)

**Development:**
- ESLint v9 (linting)
- TypeScript (type safety)
- @types/node v20 (Node.js types)

## 🎨 Design Principles

### Modern Technical Editorial
- **Editorial warmth**: Serif headings, cream backgrounds
- **Technical precision**: Mono fonts, subtle lines
- **Spacious layout**: Open, breathing room
- **Vibrant accents**: Orange for interactions

### Animation Philosophy
- **No abrupt appearances**: Fade-in transitions
- **Physics over duration**: Smooth easing
- **Subtle interactions**: 1.02x hover scales
- **Staggered cascades**: Sequential animations

## 🤝 Contributing

This project follows Spec-Driven Development:

1. **Specification** - Define requirements
2. **Planning** - Design architecture
3. **Tasks** - Break down implementation
4. **Implementation** - Write code with tests
5. **Documentation** - Record decisions

## 📜 License

MIT License - See main project README for details.

---

**Built with ❤️ using Next.js and Spec-Driven Development**