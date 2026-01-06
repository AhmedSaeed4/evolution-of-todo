# Research: Homepage Design & Implementation

**Feature**: 008-homepage-design
**Date**: 2026-01-05
**Status**: Complete

## Better Auth Integration Patterns

### Decision: Client-side auth state consumption
**Rationale**: The homepage needs to display different UI based on authentication state (logged-in vs logged-out). Better Auth provides client-side hooks that can be used in React components without server-side dependencies.

**Implementation Pattern**:
- Use `useSession()` hook from Better Auth client
- Handle loading states gracefully
- Provide fallback UI during auth state resolution

**Alternatives Considered**:
- Server-side rendering with auth cookies (rejected: violates statelessness, adds complexity)
- Manual JWT parsing (rejected: insecure, error-prone)

### Reference: Better Auth Next.js Patterns
```typescript
// Client component
import { useSession } from '@/lib/auth-client'

function NavBar() {
  const { data: session, isPending } = useSession()

  if (isPending) return <LoadingState />
  if (!session) return <LoggedOutNav />
  return <LoggedInNav user={session.user} />
}
```

## Framer Motion Performance Optimization

### Decision: Staggered loading with CSS transforms
**Rationale**: 5+ animated components loading simultaneously can cause performance issues. Using staggered animations and GPU-accelerated transforms ensures 60fps performance.

**Key Findings**:
1. **Stagger Delays**: 0.1s between list items, 0.2s between sections
2. **Transform Usage**: Use `scale`, `y`, `opacity` only (GPU-accelerated)
3. **Avoid**: `height`, `width` animations (causes layout thrashing)

**Performance Targets**:
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.0s
- Cumulative Layout Shift: <0.1

### Animation Pattern Research
**From ANIMATION_PATTERNS.md**:
- `FadeInUp`: 0.8s duration, `ease: [0.22, 1, 0.36, 1]`
- `LineDraw`: 1.2s duration for technical lines
- `Stagger`: 0.1s per item in lists

## Next.js 16.1.1 App Router Patterns

### Decision: Client components with proper boundaries
**Rationale**: Next.js 16+ requires clear separation between server and client components. Homepage components that use auth state must be client components.

**Key Patterns**:
1. **Component Structure**:
   - Page: Server component (layout structure)
   - Interactive components: Client components (`'use client'`)
   - Shared UI: Can be server or client based on usage

2. **Auth State Propagation**:
   - Root layout: Server component with auth provider
   - Interactive parts: Client components with `useSession()`

3. **Performance Optimization**:
   - Use React Suspense for loading states
   - Implement proper error boundaries
   - Leverage Next.js streaming where appropriate

### File Structure Pattern
```typescript
// app/page.tsx (Server Component)
import { HeroSection } from '@/components/home/hero-section'
import { AuthProvider } from '@/components/auth-provider'

export default function HomePage() {
  return (
    <AuthProvider>
      <HeroSection />
      {/* ... other components */}
    </AuthProvider>
  )
}

// components/home/hero-section.tsx ('use client')
'use client'
import { useSession } from '@/lib/auth-client'

export function HeroSection() {
  const { data: session } = useSession()
  // Component logic
}
```

## Design System Integration

### Decision: Direct token usage from UI Design skill
**Rationale**: The homepage must strictly follow the Modern Technical Editorial aesthetic defined in the UI Design skill.

**Required Tokens**:
- **Colors**: `#F9F7F2` (cream), `#FF6B4A` (orange), `#2A1B12` (espresso)
- **Typography**: Playfair Display (headings), DM Sans (body), JetBrains Mono (labels)
- **Spacing**: 4px grid system
- **Borders**: 1px technical lines (`#2A1B12/10`)

### Animation Integration
**From UI Animation skill**:
- Use `motion()` wrappers for all interactive elements
- Apply `fadeInUp` for content entrances
- Use `lineDraw` for dividers
- Implement staggered lists for features

## Testing Strategy

### Component Testing
**Tools**: Jest + React Testing Library
**Coverage**:
- Auth state transitions (logged-out → logged-in)
- Hover interactions and visual feedback
- Responsive breakpoints
- Accessibility (ARIA labels, keyboard navigation)

### E2E Testing
**Tools**: Cypress
**Scenarios**:
- Page load performance (<2s)
- Auth state persistence across page reloads
- Mobile responsiveness (3+ breakpoints)
- Interactive elements (buttons, links)

## Risk Assessment

### Low Risk
- **Auth Integration**: Well-documented patterns available
- **Design System**: Tokens and patterns clearly defined
- **Component Structure**: Standard Next.js patterns

### Medium Risk
- **Performance**: 5+ animated components could impact load time
  - **Mitigation**: Staggered loading, code splitting
- **State Management**: Auth state synchronization
  - **Mitigation**: Proper loading states, error boundaries

## Dependencies

### Required Packages
- `framer-motion` (animations)
- `lucide-react` (icons)
- Existing: `better-auth`, `next`, `react`, `react-dom`, `tailwindcss`

### No New Backend Requirements
- All functionality is frontend-only
- Uses existing Better Auth infrastructure
- No new API endpoints needed

## Conclusion

All technical unknowns have been resolved through research. The implementation plan is solid and follows established patterns. Ready to proceed to Phase 1 design and contract generation.