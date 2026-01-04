# Phase 0 Research: Todo Full-Stack Web Application Frontend

**Branch**: `003-frontend-design`
**Date**: 2025-12-29
**Feature**: Frontend Implementation for Todo Full-Stack Web Application

---

## Research Questions & Findings

### 1. Better Auth Configuration for Next.js 16+ App Router

**Decision**: Use Better Auth with JWT plugin for token-based authentication

**Rationale**:
- The spec explicitly requires Better Auth with JWT strategy
- Next.js 16+ App Router requires server-side session handling
- JWT tokens need to be injected into API client for backend integration
- Better Auth provides `createAuthClient()` for React/Next.js integration

**Implementation Pattern**:
```typescript
// src/lib/auth.ts
import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [jwtClient()]
});
```

**Alternatives Considered**:
- NextAuth.js (older, less focused on JWT)
- Clerk (proprietary, not open-source)
- Supabase Auth (tied to Supabase ecosystem)

---

### 2. Mock Data Strategy for Backend-Ready API Layer

**Decision**: In-memory mock store with TODO comments for future FastAPI integration

**Rationale**:
- Spec requires "mock data/services initially to ensure seamless backend integration later"
- All API methods must have clear `// TODO:` comments for backend endpoints
- TypeScript interfaces must match future backend schema exactly
- Mock implementation should use same function signatures as final API

**Mock Store Structure**:
```typescript
// src/lib/api.ts
let mockTasks: Task[] = [];
let mockUsers: User[] = [];

// Each method includes:
// TODO: Replace with fetch() to FastAPI endpoint
// TODO: POST /api/{user_id}/tasks
```

**API Integration Points** (from spec):
- `GET /api/{user_id}/tasks` - Get all tasks with filters
- `POST /api/{user_id}/tasks` - Create new task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

---

### 3. Framer Motion Animation Patterns for Modern Technical Editorial

**Decision**: Use motion variants following ui-animation skill patterns

**Rationale**:
- Spec explicitly references ui-animation skill with FadeInUp, LineDraw, Stagger
- Modern Technical Editorial aesthetic requires smooth, subtle animations
- Physics-based easing over fixed durations
- Stagger effects for lists and grids

**Required Variants** (to be created in `src/motion/variants.ts`):
```typescript
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
```

**Animation Requirements**:
- Task list entrance: Staggered fade up
- Modal appearance: Slide up with fadeInUp
- Task completion: Checkbox scale spring
- Task deletion: Fade out + scale
- Filter changes: Layout animation

---

### 4. Tailwind Configuration with Modern Technical Editorial Tokens

**Decision**: Configure Tailwind with design tokens from ui-design skill

**Rationale**:
- Spec requires "no pure white" backgrounds
- Typography triad: Serif (Playfair), Sans (DM Sans), Mono (JetBrains Mono)
- Color palette: Cream background (#F9F7F2), Technical lines (#2A1B12/10), Orange accent (#FF6B4A)
- Spacing and layout patterns from skill documentation

**Tailwind Config Structure**:
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#F9F7F2',  // Cream
        surface: '#F5F2E9',     // Slightly darker cream
        structure: '#2A1B12',   // Technical line color
        accent: '#FF6B4A',      // Vibrant orange
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // ... spacing, borders, etc.
    }
  }
}
```

**Font Loading Strategy**:
- Use Google Fonts or @fontsource packages
- Load in `src/app/globals.css`
- Apply via Tailwind classes: `font-serif`, `font-sans`, `font-mono`

---

### 5. Protected Route Pattern for Next.js App Router

**Decision**: Higher-order component wrapper using `useEffect` redirect

**Rationale**:
- Next.js App Router doesn't support traditional route guards
- Must wrap dashboard layout with ProtectedRoute component
- Use `useAuth` hook to check authentication state
- Redirect to `/login` if not authenticated
- Show loading spinner while checking auth

**Implementation Pattern**:
```typescript
// src/components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <AnimatedSpinner />;
  }

  return isAuthenticated ? children : null;
}
```

**Usage in Layout**:
```typescript
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
    </ProtectedRoute>
  );
}
```

---

### 6. Search Debounce and Filter State Management

**Decision**: Custom hooks with useMemo + debounce for performance

**Rationale**:
- Spec requires 300ms debounce for search
- URL query params for shareable filter states
- useMemo for filtered results to prevent unnecessary recalculations
- Real-time updates without performance degradation

**Hook Structure**:
```typescript
// src/hooks/useTasks.ts
export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Memoized filtered results
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Apply all filters
    });
  }, [tasks, debouncedSearch, filters.status, filters.priority]);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Update filters from URL
  }, []);

  return { tasks: filteredTasks, setFilters, isLoading };
}
```

---

### 7. Type Safety for Backend Compatibility

**Decision**: Strict TypeScript interfaces matching future FastAPI schema

**Rationale**:
- All interfaces must be backend-compatible from day one
- Date fields use ISO 8601 strings
- Optional fields marked with `?`
- Discriminated unions for priority/category/status
- No `any` types allowed

**Interface Definitions** (from spec):
```typescript
// src/types/index.ts
export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'home' | 'other';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  status: TaskStatus;
  completed: boolean;
  dueDate?: string;  // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  userId: string;
}
```

---

## Technology Stack Validation

| Technology | Spec Requirement | Version | Justification |
|:---|:---|:---|:---|
| **Next.js** | 16+ App Router | Latest | Modern React framework, required by spec |
| **TypeScript** | Required | Latest | Type safety, backend compatibility |
| **Tailwind CSS** | Required | Latest | Design tokens, utility-first |
| **Framer Motion** | Required | Latest | Animation library, ui-animation skill |
| **Better Auth** | JWT strategy | Latest | Authentication, JWT tokens |
| **Lucide React** | Icons | Latest | Icon library, lightweight |
| **Playfair Display** | Serif font | Google Fonts | Editorial aesthetic |
| **DM Sans** | Body font | Google Fonts | Modern sans-serif |
| **JetBrains Mono** | Mono font | Google Fonts | Technical labels |

---

## Implementation Order Clarifications

### Phase 1: Project Setup (Clear)
1. Initialize Next.js with exact flags from spec
2. Install all dependencies
3. Configure Tailwind with design tokens
4. Set up font loading

### Phase 2: Design System (Clear)
1. Create motion variants file
2. Build reusable UI components
3. Set up global styles

### Phase 3: Layout & Auth (Clear)
1. Navbar with conditional auth state
2. Auth pages (login/signup)
3. Protected route wrapper
4. Dashboard layout

### Phase 4: Core Features (Clear)
1. TaskCard with all interactions
2. TaskList with stagger animation
3. TaskForm (create/edit modes)
4. Complete/delete functionality

### Phase 5: Organization (Clear)
1. Priority/Category badges
2. Search with debounce
3. Filter components
4. Sort functionality

### Phase 6: Polish (Clear)
1. Empty states
2. Loading states
3. Error handling
4. Responsive testing

---

## Open Questions / Decisions Made

### ✅ Resolved: Better Auth vs NextAuth.js
**Decision**: Better Auth (explicitly required by spec)

### ✅ Resolved: Mock Data Strategy
**Decision**: In-memory store with TODO comments for API integration

### ✅ Resolved: Animation Library
**Decision**: Framer Motion with skill-defined variants

### ✅ Resolved: Design System Source
**Decision**: ui-design skill tokens (no custom design needed)

### ✅ Resolved: Protected Route Pattern
**Decision**: HOC wrapper with useEffect redirect for App Router

### ✅ Resolved: API Endpoint Structure
**Decision**: Follow REST patterns from spec (future FastAPI endpoints)

---

## Dependencies to Install

```bash
# Core framework
npx create-next-app@latest frontend \
  --yes \
  --no-react-compiler \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --no-import-alias

# Additional dependencies
npm install framer-motion lucide-react better-auth

# Fonts (via Google Fonts or @fontsource)
# Playfair Display, DM Sans, JetBrains Mono
```

---

## Next Steps

1. **Execute Phase 1**: Generate data-model.md, contracts/, and quickstart.md
2. **Update Agent Context**: Run `.specify/scripts/bash/update-agent-context.sh claude`
3. **Create Implementation Tasks**: Generate tasks.md with user story organization
4. **Begin Implementation**: Start with project setup and design system

---

**Research Status**: ✅ Complete
**All NEEDS CLARIFICATION items resolved**