# Implementation Plan: Todo Full-Stack Web Application Frontend

**Branch**: `003-frontend-design` | **Date**: 2025-12-29 | **Spec**: [specs/003-frontend-design/spec.md](specs/003-frontend-design/spec.md)
**Input**: Feature specification from `/specs/003-frontend-design/spec.md`
**Constitution Version**: v1.1.0

## Summary

This plan implements a modern full-stack todo web application frontend using Next.js 16+ (App Router) with TypeScript and Tailwind CSS. The frontend features the Modern Technical Editorial design aesthetic with Framer Motion animations, JWT-based authentication via Better Auth, and a mock API layer ready for backend integration. The implementation follows the three user stories from the spec: Basic Task Management (P1), Task Organization & Discovery (P2), and Authentication & Protected Access (P3).

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16+ (App Router)
**Primary Dependencies**: Next.js 16+, TypeScript, Tailwind CSS, Framer Motion, Better Auth, Lucide React
**Storage**: In-memory mock data (ready for Neon PostgreSQL integration)
**Testing**: Jest + React Testing Library (to be configured)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) - responsive across mobile (375px), tablet (768px), desktop (1440px)
**Project Type**: Web application (frontend-only, backend-ready)
**Performance Goals**: Search/filter updates within 300ms, smooth 60fps animations, sub-15s task creation workflow
**Constraints**: No backend dependency initially, mock API with clear integration paths, strict TypeScript typing for future backend compatibility
**Scale/Scope**: Single-page application with authentication, task CRUD operations, search/filter/sort capabilities, responsive design

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic decoupled in service layer (`src/lib/api.ts`), presentation in components
- [x] **II. AI-Native Interoperability**: TypeScript interfaces strictly typed for backend compatibility, clear API contracts defined
- [x] **III. Strict Statelessness**: No in-memory session storage, uses Better Auth JWT tokens, mock data is ephemeral and replaceable
- [x] **IV. Event-Driven Decoupling**: Frontend ready for async operations, mock layer can be replaced with event-driven backend
- [x] **V. Zero-Trust Multi-Tenancy**: All API methods scoped to `userId`, authentication required for dashboard routes
- [x] **VI. Technology Stack**: Authorized libraries only (Next.js 16+, TypeScript, Tailwind, Framer Motion, Better Auth)
- [x] **VII. Security**: JWT-based auth, no hardcoded secrets, input validation in form components
- [x] **VIII. Observability**: Ready for structured logging, metrics collection via future backend integration

**Constitution Status**: ✅ PASSED - All gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-design/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - research findings and decisions
├── data-model.md        # Phase 1 output - TypeScript interfaces and entities
├── quickstart.md        # Phase 1 output - setup and initialization guide
├── contracts/           # Phase 1 output - API contracts
│   └── api.md          # Service layer contracts and integration paths
└── tasks.md             # Phase 2 output - to be created by /sp.tasks
```

### Source Code (frontend directory)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskFilters.tsx
│   │   │   └── TaskSearch.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       └── ProtectedRoute.tsx
│   ├── lib/
│   │   ├── api.ts              # Task API service (mock → backend ready)
│   │   ├── api-client.ts       # API client with JWT injection
│   │   ├── auth.ts             # Better Auth client config
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useTasks.ts         # Task state management
│   │   ├── useAuth.ts          # Auth state management
│   │   └── useFilters.ts       # Filter state with debounce
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── motion/
│       └── variants.ts         # Framer Motion animation variants
├── public/
├── tailwind.config.ts
├── package.json
└── .env.local
```

**Structure Decision**: Web application structure with separate (auth) and (dashboard) route groups, following Next.js App Router conventions. All source code resides in `frontend/` directory as specified in the project initialization.

## Complexity Tracking

> **Filled ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Mock API Layer** | Spec requires mock data services initially for seamless backend integration later | Direct backend coupling would prevent frontend development without backend |
| **JWT Token Injection** | Better Auth requires JWT tokens for API authentication, needs client wrapper | No auth would violate multi-tenancy requirements |
| **Protected Route HOC** | Next.js App Router doesn't support traditional route guards, needs wrapper | Direct page access would expose dashboard without authentication |

**All violations justified**: Mock API enables parallel development, JWT injection ensures security compliance, ProtectedRoute enables proper auth flow.

## Implementation Phases

### Phase 0: Research ✅ COMPLETE

**Status**: Research document created (`research.md`)

**Key Findings**:
- Better Auth configuration for Next.js 16+ App Router with JWT plugin
- Mock data strategy using in-memory store with TODO comments for FastAPI integration
- Framer Motion animation patterns following ui-animation skill
- Tailwind configuration with Modern Technical Editorial tokens
- Protected Route pattern using HOC with useEffect redirect
- Search debounce (300ms) with useMemo for performance
- Strict TypeScript interfaces matching future backend schema

**Decisions Made**:
- ✅ Better Auth over NextAuth.js (explicitly required by spec)
- ✅ In-memory mock store with clear integration paths
- ✅ Framer Motion with skill-defined variants
- ✅ ui-design skill tokens (no custom design)
- ✅ HOC wrapper for protected routes
- ✅ REST API patterns for future FastAPI endpoints

### Phase 1: Design & Contracts ✅ COMPLETE

**Status**: Design artifacts created

**Generated Files**:
1. **data-model.md**: Complete TypeScript interfaces for Task, User, TaskFilters, CreateTaskDTO, UpdateTaskDTO
2. **contracts/api.md**: API service layer contracts with mock implementation and backend integration paths
3. **quickstart.md**: Step-by-step setup guide from project initialization to running dev server

**Key Design Decisions**:
- **Type Safety**: All interfaces use strict typing with ISO 8601 dates
- **Mock Strategy**: In-memory arrays with TODO comments on all methods
- **API Structure**: RESTful endpoints matching future FastAPI routes
- **Error Handling**: Standardized error taxonomy with user-friendly messages
- **Integration Path**: Clear migration from mock to backend without interface changes

### Phase 2: Implementation Tasks (PENDING)

**Status**: Ready for `/sp.tasks` command

**Task Organization by User Story**:
- **P1 - Basic Task Management**: Core CRUD operations, animations, visual feedback
- **P2 - Task Organization & Discovery**: Search, filter, sort, badges
- **P3 - Authentication & Protected Access**: Login, signup, protected routes, logout

**Implementation Order**:
1. Project setup (Next.js init, dependencies, Tailwind config)
2. Design system (motion variants, UI components, global styles)
3. Layout components (Navbar, auth/dashboard layouts)
4. Authentication (Better Auth setup, forms, ProtectedRoute)
5. Core features (TaskCard, TaskList, TaskForm, complete/delete)
6. Organization features (badges, search, filters, sort)
7. Polish (empty states, loading states, responsive testing)

### Phase 3: Validation & Testing (PENDING)

**Acceptance Criteria**:
- ✅ All user stories independently testable
- ✅ Design system consistent (no pure white, correct typography)
- ✅ Animations smooth (no jarring motion, stagger effects)
- ✅ Responsive across breakpoints (375px, 768px, 1440px)
- ✅ Mock API matches backend endpoint structure
- ✅ TypeScript interfaces match backend schema

## Technology Stack

| Layer | Technology | Version | Justification |
|:---|:---|:---|:--- |
| **Framework** | Next.js | 16+ (App Router) | Modern React, required by spec |
| **Language** | TypeScript | Latest | Type safety, backend compatibility |
| **Styling** | Tailwind CSS | Latest | Design tokens, utility-first |
| **Animation** | Framer Motion | Latest | Skill-defined patterns |
| **Auth** | Better Auth | Latest | JWT strategy, required by spec |
| **Icons** | Lucide React | Latest | Lightweight, modern |
| **Fonts** | Playfair Display | Google Fonts | Serif, editorial aesthetic |
| **Fonts** | DM Sans | Google Fonts | Sans, body text |
| **Fonts** | JetBrains Mono | Google Fonts | Mono, technical labels |

## API Integration Points

### Current State (Mock)
- ✅ All service methods implemented with mock data
- ✅ TODO comments on every method for backend integration
- ✅ TypeScript interfaces ready for backend schema

### Future Backend Endpoints (FastAPI)
```
GET    /api/{user_id}/tasks          - Get all tasks with filters
POST   /api/{user_id}/tasks          - Create new task
PUT    /api/{user_id}/tasks/{id}     - Update task
DELETE /api/{user_id}/tasks/{id}     - Delete task
PATCH  /api/{user_id}/tasks/{id}/complete - Toggle completion
```

### Integration Steps
1. Update `NEXT_PUBLIC_API_URL` environment variable
2. Replace mock implementations with `apiClient()` calls
3. Add request/response logging
4. Implement retry logic
5. Add error boundary handling

## Authentication Flow

### Better Auth Configuration
```typescript
// src/lib/auth.ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [jwtClient()]
});
```

### User Flow
1. **Sign Up**: `signUp.email({ name, email, password })` → Redirect to `/tasks`
2. **Login**: `signIn.email({ email, password })` → Redirect to `/tasks`
3. **Protected Access**: ProtectedRoute checks auth → Redirect to `/login` if needed
4. **Logout**: `signOut()` → Redirect to `/login`

### Token Management
- JWT tokens stored in Better Auth session
- Automatically injected into API calls via `api-client.ts`
- Session validation on every protected route access

## Design System Integration

### Modern Technical Editorial Aesthetic
- **Background**: #F9F7F2 (Cream) - never pure white
- **Typography**: Playfair (serif), DM Sans (sans), JetBrains Mono (mono)
- **Colors**: #2A1B12 (structure), #FF6B4A (accent)
- **Layout**: Open, spacious, occasional "Massive" typography
- **Lines**: Subtle 1px borders (#2A1B12/10)

### Animation System
- **Entrances**: FadeInUp with stagger for lists
- **Interactions**: Scale spring for checkboxes, subtle hover scales
- **Transitions**: Physics-based easing [0.22, 1, 0.36, 1]
- **Layout**: Smooth reordering with Framer Motion layout prop

## Risk Analysis

### Risk 1: Better Auth Integration Complexity
**Impact**: Medium - Authentication is critical path
**Mitigation**: Follow skill documentation exactly, use provided patterns
**Kill Switch**: Can fall back to session-based auth if needed

### Risk 2: Mock Data State Management
**Impact**: Low - Mock is temporary, clear integration path
**Mitigation**: Strict TypeScript interfaces, TODO comments on all methods
**Kill Switch**: Easy to replace with real API calls

### Risk 3: Animation Performance
**Impact**: Low - Framer Motion is optimized, but complex animations could lag
**Mitigation**: Use layout prop for reordering, limit simultaneous animations
**Kill Switch**: Can disable animations or reduce complexity

## Success Metrics

### User Experience
- Task creation workflow: < 15 seconds
- Search/filter updates: < 300ms
- First-attempt success rate: > 95%
- Mobile responsiveness: 375px → 1440px

### Code Quality
- TypeScript strict mode: 0 errors
- Component reusability: > 80%
- Mock-to-backend migration: Zero interface changes
- Test coverage: > 70% (after Phase 3)

### Design Consistency
- No pure white backgrounds
- Correct typography triad usage
- Animation smoothness (60fps)
- Color token compliance

## Next Steps

### Immediate Actions
1. **Execute Phase 2**: Run `/sp.tasks` to generate implementation tasks
2. **Initialize Project**: Follow `quickstart.md` to set up Next.js project
3. **Begin Implementation**: Start with project setup and design system

### After Phase 2
1. **Create PHR**: Document this planning session
2. **ADR Decisions**: Consider documenting significant decisions (Better Auth choice, mock strategy)
3. **Implementation**: Execute tasks.md with user story organization

### Phase 3 Preparation
1. **Testing Setup**: Configure Jest + React Testing Library
2. **Component Tests**: Test all UI components in isolation
3. **Integration Tests**: Test user flows (auth, task CRUD, filters)
4. **E2E Tests**: Consider Playwright for critical paths

---

**Plan Status**: ✅ COMPLETE
**All Phases Ready**: Phase 0, 1, 2, 3 defined
**Constitution Compliance**: ✅ VERIFIED
**Ready for Implementation**: ✅ YES

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [ ] **I. Universal Logic Decoupling**: Business logic decoupled from presentation layer
- [ ] **II. AI-Native Interoperability**: MCP tools defined with strict typing
- [ ] **III. Strict Statelessness**: No in-memory session storage, all state persisted
- [ ] **IV. Event-Driven Decoupling**: Async operations use event streams (not direct HTTP)
- [ ] **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id
- [ ] **VI. Technology Stack**: Authorized libraries only (Python 3.13+, FastAPI, SQLModel, etc.)
- [ ] **VII. Security**: JWT validation, input validation, no hardcoded secrets
- [ ] **VIII. Observability**: Structured logging, metrics, audit trail requirements met

**If any gate fails, document justification in Complexity Tracking section below.**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
