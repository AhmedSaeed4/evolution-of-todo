# Phase 5: Event-Driven Microservices Frontend

> Production-ready Next.js 16 frontend with Dapr microservices integration, real-time WebSocket/SSE updates, and AI Chatbot capabilities.

## 🎯 Overview

This is the **Phase 5** frontend application built with Next.js 16+, featuring event-driven microservices architecture:

### Phase 5 Microservices Features
- **Dapr Proxy Pattern**: Frontend API routes proxy requests through Dapr sidecar
- **Real-time Updates**: WebSocket connections with SSE fallback for live task updates
- **Microservices Integration**: 5 independent backend services via Dapr Pub/Sub
- **Recurring Tasks**: Auto-generation of next instance on completion
- **Automated Reminders**: Dapr cron binding triggers notification processing
- **Complete Audit Trail**: View all task events with full context
- **Multi-Service Docker**: Standalone output for Kubernetes deployment

### Phase 2-4 Features (Inherited)
- **App Router Architecture** with TypeScript 5.x
- **Modern Technical Editorial Design System**
- **Framer Motion Animations** with editorial easing
- **Better Auth v1.4.9** with Neon PostgreSQL
- **Profile Management** with comprehensive user settings
- **Task Management** with full CRUD operations
- **Dual-Agent System** with Xiaomi mimo-v2-flash
- **ChatKit Integration** with persistent chat history (14-method store)

**Status**: ✅ **COMPLETE** (95% - Cloud deployment pending in 014)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16.1.6 | React framework with App Router |
| **Language** | TypeScript 5.x | Type safety |
| **Styling** | Tailwind CSS 4.x | Utility-first CSS |
| **Animations** | Framer Motion 12.23.26 | Motion design |
| **Icons** | Lucide React 0.562.0 | Icon library |
| **Toasts** | Sonner 2.0.7 | Notification toasts |
| **Auth** | Better Auth 1.4.9 | Authentication framework |
| **Database** | Neon PostgreSQL (pg 8.16.3) | Shared database |
| **ChatKit** | @openai/chatkit-react 1.4.1 | AI chat interface |
| **Microservices** | Dapr 1.14+ | Service mesh & sidecar |
| **Real-time** | WebSocket + SSE | Live updates |

### Microservices Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                        │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  App Router  │  │  API Routes   │  │  WebSocket/SSE Hook  │ │
│  │  (/tasks)    │  │  (Dapr Proxy) │  │  (Real-time)         │ │
│  └──────────────┘  └───────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐   ┌──────────────────┐
         │   Dapr Sidecar   │   │   WebSocket Svc  │
         │   (Port 3500)    │   │   (Port 8001)    │
         └──────────────────┘   └──────────────────┘
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐   ┌──────────────────┐
         │   backend-api    │   │  Real-time       │
         │   (Port 8000)    │◄──┤  Updates         │
         └──────────────────┘   └──────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │     Kafka        │
         │   (Redpanda)     │
         └──────────────────┘
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│  audit  │   │ recurring│  │notification│
│ service │   │ service │  │  service  │
└─────────┘   └─────────┘   └─────────┘
```

### Dapr Proxy Pattern

Since browsers cannot access Dapr directly, frontend API routes act as proxies:

```typescript
// Frontend API Route → Dapr Sidecar → Backend Microservice
/api/tasks → http://localhost:3500/v1.0/invoke/backend-api/method/api/{userId}/tasks
```

---

## 📁 Project Structure

```
phase-5/frontend/
├── src/
│   ├── app/                       # Next.js 16 App Router
│   │   ├── (auth)/               # Authentication route group
│   │   │   ├── layout.tsx        # Auth layout (centered, no navbar)
│   │   │   ├── login/            # Login page
│   │   │   └── signup/           # Signup page
│   │   │
│   │   ├── (dashboard)/          # Protected route group
│   │   │   ├── layout.tsx        # Dashboard layout (navbar, container)
│   │   │   ├── tasks/            # Task management page
│   │   │   │   └── page.tsx      # Tasks with real-time updates
│   │   │   └── profile/          # Profile settings page
│   │   │       └── page.tsx
│   │   │
│   │   ├── chatbot/              # AI ChatKit page
│   │   │   └── page.tsx          # OpenAI ChatKit component
│   │   │
│   │   ├── test/                 # Component testing playground
│   │   │   └── page.tsx
│   │   │
│   │   ├── api/                  # API Routes (Dapr proxy + ChatKit)
│   │   │   ├── auth/[...all]/    # Better Auth handler
│   │   │   │   └── route.ts
│   │   │   ├── chatkit/          # ChatKit Dapr proxy
│   │   │   │   ├── route.ts      # Main ChatKit endpoint
│   │   │   │   └── mock/         # Mock ChatKit endpoint
│   │   │   ├── tasks/            # Tasks Dapr proxy
│   │   │   │   ├── route.ts      # List/Create tasks
│   │   │   │   └── [id]/         # Single task CRUD
│   │   │   │       └── route.ts
│   │   │   ├── notifications/    # Notifications Dapr proxy
│   │   │   │   ├── route.ts      # List notifications
│   │   │   │   └── [id]/         # Notification actions
│   │   │   │       └── route.ts
│   │   │   └── health/           # Health check
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css           # Tailwind + design tokens
│   │   ├── layout.tsx            # Root layout with ChatKit CDN
│   │   └── page.tsx              # Landing page
│   │
│   ├── components/               # React components
│   │   ├── auth/                 # Authentication components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── home/                 # Landing page components
│   │   │   ├── hero-section.tsx
│   │   │   ├── features-grid.tsx
│   │   │   ├── tech-stack.tsx
│   │   │   ├── footer.tsx
│   │   │   └── nav-bar.tsx
│   │   ├── layout/               # Layout components
│   │   │   └── Navbar.tsx        # Navigation with notifications
│   │   ├── notifications/        # Notification components
│   │   │   ├── NotificationPanel.tsx
│   │   │   └── NotificationItem.tsx
│   │   ├── profile/              # Profile management
│   │   │   ├── ProfileInfoCard.tsx
│   │   │   ├── PasswordChangeCard.tsx
│   │   │   ├── AccountInfoCard.tsx
│   │   │   ├── TaskStatsCard.tsx
│   │   │   └── DangerZoneCard.tsx
│   │   ├── tasks/                # Task management
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   ├── TaskSearch.tsx
│   │   │   ├── RecurringOptions.tsx
│   │   │   └── DateTimePicker.tsx
│   │   └── ui/                   # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Checkbox.tsx
│   │       ├── Modal.tsx
│   │       └── Badge.tsx
│   │
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Authentication context provider
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts            # Auth hook (re-export)
│   │   ├── useTasks.ts           # Task CRUD with real-time updates
│   │   ├── useFilters.ts         # Task filtering (status, priority, category, tags)
│   │   ├── useNotifications.ts   # Notification management
│   │   ├── useAudit.ts           # Audit log hook
│   │   ├── useWebSocket.ts       # WebSocket/SSE real-time updates
│   │   └── use-auth-state.ts     # Auth state utilities
│   │
│   ├── lib/                      # Utilities & libraries
│   │   ├── auth.ts               # Better Auth client config
│   │   ├── auth-server.ts        # Better Auth server config
│   │   ├── api.ts                # API methods (tasks, notifications, audit)
│   │   ├── api-client.ts         # Generic API client with JWT
│   │   ├── utils.ts              # Helper functions
│   │   ├── websocket.ts          # WebSocket manager
│   │   └── tagSearch.ts          # Tag search parsing
│   │
│   ├── motion/                   # Framer Motion configuration
│   │   ├── variants.ts           # Motion variants (fadeInUp, stagger, etc.)
│   │   └── patterns.ts           # Animation patterns
│   │
│   └── types/                    # TypeScript types
│       └── index.ts              # Type definitions
│
├── public/                       # Static assets
├── scripts/                      # Database initialization scripts
├── .dockerignore                 # Docker build exclusions
├── .env.local.example            # Environment variable template
├── Dockerfile                    # Multi-stage Docker build
├── next.config.ts                # Next.js standalone config
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS + Tailwind v4
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint configuration
├── README.md                     # This file
├── BACKEND_INTEGRATION.md        # Backend integration guide
├── INTEGRATION_CHECKLIST.md      # Backend requirements checklist
└── PROJECT_COMPLETION_SUMMARY.md # Project status
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- **Neon PostgreSQL database** (shared with backend)
- **Dapr CLI 1.14+** (for local development with sidecar)
- **Backend microservices** running

### 1. Environment Setup

```bash
# Navigate to frontend directory
cd phase-5/frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
# Auth Bypass (for testing without backend)
NEXT_PUBLIC_AUTH_BYPASS=false

# Database (shared with backend)
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-generated-64-char-secret
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Backend URLs (for Dapr proxy)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# WebSocket/SSE (real-time updates)
NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8001
NEXT_PUBLIC_SSE_URL=http://127.0.0.1:8001/api/sse

# Dapr Configuration
DAPR_HOST=localhost
DAPR_HTTP_PORT=3500

# Internal URLs (server-side)
BACKEND_URL_INTERNAL=http://backend:8000
EOF
```

### 2. Run Development Server

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

### 3. Run with Dapr (Local Development)

```bash
# Start Dapr sidecar with frontend
dapr run --app-id frontend --app-port 3000 --dapr-http-port 3500 \
    --components-path ../k8s-dapr/components \
    npm run dev
```

---

## 📡 Real-time Updates (WebSocket + SSE)

### WebSocket Hook (`useWebSocket.ts`)

Automatically manages real-time connections:

```typescript
const { isConnected, connectionError } = useWebSocket(userId);

// Features:
// - Primary: WebSocket connection to ws://127.0.0.1:8001/ws?user_id={id}
// - Fallback: SSE after 2 WebSocket errors
// - Auto-reconnect on disconnect
// - Task list auto-refresh on updates
```

### WebSocket Service Endpoints

| Endpoint | Purpose |
|----------|---------|
| `ws://localhost:8001/ws?user_id={id}` | WebSocket connection |
| `http://localhost:8001/api/sse/{user_id}` | SSE fallback |

### Real-time Events

- `task-created` - New task added → auto-refresh task list
- `task-updated` - Task modified → update task in list
- `task-completed` - Task toggled → update completion status
- `task-deleted` - Task removed → remove from list
- `reminder-due` - Reminder triggered → show notification toast

---

## 🔌 API Routes (Dapr Proxy)

### Tasks API

| Method | Route | Dapr Target | Purpose |
|--------|-------|-------------|---------|
| GET | `/api/tasks` | backend-api | List tasks with filters |
| POST | `/api/tasks` | backend-api | Create task |
| GET | `/api/tasks/[id]` | backend-api | Get single task |
| PATCH | `/api/tasks/[id]` | backend-api | Update task |
| DELETE | `/api/tasks/[id]` | backend-api | Delete task |

### Notifications API

| Method | Route | Dapr Target | Purpose |
|--------|-------|-------------|---------|
| GET | `/api/notifications` | backend-api | List notifications |
| PATCH | `/api/notifications/[id]/read` | backend-api | Mark as read |
| DELETE | `/api/notifications/[id]` | backend-api | Delete notification |

### ChatKit API

| Method | Route | Dapr Target | Purpose |
|--------|-------|-------------|---------|
| GET | `/api/chatkit` | backend-api | Get/create session |
| POST | `/api/chatkit` | backend-api | Chat streaming (SSE) |

---

## 🎨 Design System

### Modern Technical Editorial Aesthetic

#### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#F9F7F2` | Main page background (Cream) |
| `--color-surface` | `#F0EBE0` | Cards, sections (Darker Cream) |
| `--color-structure` | `#2A1B12` | Headings, main text (Espresso) |
| `--color-wireframe` | `#E5E0D6` | Borders, dividers (Wireframe Grey) |
| `--color-accent` | `#FF6B4A` | Primary buttons, highlights (Vibrant Orange) |

#### Typography
| Type | Font | Usage |
|------|------|-------|
| Serif | **Playfair Display** (400, 700) | Headings |
| Sans | **DM Sans** (400, 500, 700) | Body text |
| Mono | **JetBrains Mono** (400, 500) | Labels, navigation, data |

#### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-editorial` | `2.5rem` | Content sections |
| `--spacing-technical` | `0.5rem` | Technical elements |

#### Animation
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | Smooth, premium feel |

#### Motion Variants
| Variant | Purpose |
|---------|---------|
| `fadeInUp` | Signature entrance (0.8s) |
| `staggerContainer` | List/grid staggering (0.1s delay) |
| `scaleIn` | Checkbox spring physics |
| `fadeOut` | Deletion animations |
| `lineDraw` | Technical dividers (1.2s) |
| `hoverScale` | Minimal interaction (1.02x) |

---

## 📊 Pages & Routes

### Public Routes
| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Landing page (Hero, Features, Tech Stack, Footer) |
| `/login` | `app/(auth)/login/page.tsx` | Login form |
| `/signup` | `app/(auth)/signup/page.tsx` | Signup form |

### Protected Routes (via `ProtectedRoute`)
| Route | File | Purpose |
|-------|------|---------|
| `/tasks` | `app/(dashboard)/tasks/page.tsx` | Task management with real-time updates |
| `/profile` | `app/(dashboard)/profile/page.tsx` | User profile settings |
| `/chatbot` | `app/chatbot/page.tsx` | AI ChatKit agent |

### Development Routes
| Route | File | Purpose |
|-------|------|---------|
| `/test` | `app/test/page.tsx` | Component testing playground |

---

## 🔐 Authentication

### Better Auth Configuration

**Server Config** (`src/lib/auth-server.ts`):
```typescript
- Database: Neon PostgreSQL with SSL
- JWT Plugin: Enabled for backend token generation
- Email/Password: Enabled with 8-char minimum
- Trusted Origins: localhost:3000, 127.0.0.1:3000
```

**Client Config** (`src/lib/auth.ts`):
```typescript
- JWT Plugin: For backend token generation
- Base URL: Configurable via NEXT_PUBLIC_AUTH_URL
- Bypass Mode: Mock user for testing (NEXT_PUBLIC_AUTH_BYPASS=true)
```

### Auth Flow

1. User enters credentials in `/login` or `/signup`
2. Better Auth validates against PostgreSQL
3. JWT token generated and stored in httpOnly cookie
4. Session state managed in `AuthContext`
5. Protected routes check `isAuthenticated`
6. API requests include JWT via `Authorization: Bearer <token>`

### JWT Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234570490
}
```

---

## 🤖 ChatKit Integration

### Features

- **OpenAI ChatKit UI** - Production-ready chat interface via CDN
- **Streaming Responses** - Real-time agent responses via SSE
- **Tool Visualization** - MCP tool calls displayed in chat
- **Thread Persistence** - localStorage + PostgreSQL
- **Modern Design** - Cream background matching design system
- **Enhanced Loading** - Web Components detection with `customElements.whenDefined()`

### Accessing ChatKit

1. Ensure backend is running: `cd ../backend && uv run uvicorn src.backend.main:app --reload`
2. Start frontend: `npm run dev`
3. Visit: `http://localhost:3000/chatbot`
4. ChatKit loads automatically with task-related prompts

---

## 🧪 Testing

### Run Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

### Test Real-time Updates

```bash
# 1. Start WebSocket service
cd ../backend
SERVICE=websocket-service uv run uvicorn src.backend.microservices.websocket_service:app --reload --port 8001

# 2. Start frontend
cd ../frontend
npm run dev

# 3. Open browser to http://localhost:3000/tasks
# 4. Create/edit/delete tasks
# 5. Verify real-time updates across browser tabs
```

### Test Checklist

- ✅ Task creation triggers real-time update
- ✅ WebSocket connection established
- ✅ SSE fallback works when WebSocket fails
- ✅ Notifications appear for new events
- ✅ Task list auto-refreshes on changes
- ✅ Recurring tasks spawn new instances
- ✅ Reminders create notifications
- ✅ ChatKit loads at /chatbot
- ✅ JWT authentication works
- ✅ Bypass mode works for testing

---

## 🐳 Docker Deployment

### Multi-stage Dockerfile

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS start
WORKDIR /app
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
```

### Build & Run

```bash
# Build image
docker build -t phase5-frontend:v1 phase-5/frontend/

# Run container
docker run -p 3000:3000 phase5-frontend:v1
```

---

## ☸️ Kubernetes Deployment

### Helm Chart

See `../helm-charts/frontend/` for complete Kubernetes deployment:

- **Dapr enabled**: `dapr.enabled: true`
- **App ID**: `frontend`
- **App Port**: `3000`
- **Service Type**: LoadBalancer (exposed via Minikube tunnel)

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend service URL | Client-side API calls |
| `NEXT_PUBLIC_AUTH_URL` | Frontend URL | Better Auth callback |
| `NEXT_PUBLIC_WEBSOCKET_URL` | WebSocket service URL | Real-time updates |
| `NEXT_PUBLIC_SSE_URL` | SSE endpoint URL | Fallback for WebSocket |
| `DAPR_HOST` | `localhost` | Dapr sidecar host |
| `DAPR_HTTP_PORT` | `3500` | Dapr sidecar port |
| `BACKEND_URL_INTERNAL` | `http://backend:8000` | Server-side API calls |

---

## 🔗 Related Documentation

- **Main Project**: [../../README.md](../../README.md)
- **Spec 013**: [../../specs/013-microservices-dapr/spec.md](../../specs/013-microservices-dapr/spec.md)
- **Plan 013**: [../../specs/013-microservices-dapr/plan.md](../../specs/013-microservices-dapr/plan.md)
- **Tasks 013**: [../../specs/013-microservices-dapr/tasks.md](../../specs/013-microservices-dapr/tasks.md)
- **Quickstart**: [../../specs/013-microservices-dapr/quickstart.md](../../specs/013-microservices-dapr/quickstart.md)
- **Phase 5 README**: [../README.md](../README.md)
- **Minikube Deployment**: [../minikube-deployment.md](../minikube-deployment.md)
- **Backend README**: [../backend/README.md](../backend/README.md)
- **Next.js Skill**: [../../.claude/skills/nextjs/](../../.claude/skills/nextjs/)
- **UI Design Skill**: [../../.claude/skills/ui-design/](../../.claude/skills/ui-design/)
- **ChatKit Skill**: [../../.claude/skills/chatkit/SKILL.md](../../.claude/skills/chatkit/SKILL.md)

---

## 📦 Dependencies

### Core
- **Next.js**: 16.1.6 (App Router, standalone output)
- **React**: 19.2.3
- **TypeScript**: 5.x

### Authentication
- **Better Auth**: 1.4.9
- **pg**: 8.16.3 (PostgreSQL driver)

### UI & Styling
- **Tailwind CSS**: 4.x
- **Framer Motion**: 12.23.26
- **Lucide React**: 0.562.0 (icons)
- **Sonner**: 2.0.7 (toast notifications)

### AI Chat
- **@openai/chatkit-react**: 1.4.1

### Development
- **ESLint**: 9.x
- **PostCSS**: 8.x
- **TypeScript**: 5.x

---

## 🎯 Success Criteria (Phase V)

### ✅ Frontend Complete
- [x] Dapr proxy API routes implemented
- [x] Real-time updates via WebSocket/SSE
- [x] useWebSocket hook with auto-reconnect
- [x] Task list auto-refreshes on events
- [x] Notification panel with real-time badges
- [x] Recurring task UI options
- [x] Reminder datetime picker
- [x] Tag search with # syntax
- [x] Audit log viewing page
- [x] ChatKit integration maintained
- [x] Modern Technical Editorial design
- [x] JWT authentication with Better Auth
- [x] Bypass mode for testing

### ✅ Deployment Ready
- [x] Multi-stage Dockerfile
- [x] Next.js standalone output
- [x] Helm chart configured
- [x] Dapr annotations ready
- [x] Environment variables externalized
- [x] Minikube deployment tested

---

## 🚀 Upcoming (014-cloud-deployment)

- Cloud Kubernetes deployment to complete Phase 5
- Production-ready infrastructure setup
- Monitoring and observability

---

**Phase V Frontend Complete** ✅ (95% - Cloud deployment pending in 014)
*Built with ❤️ using Next.js 16, Dapr Microservices, & Spec-Driven Development*
