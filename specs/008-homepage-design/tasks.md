# Tasks: Homepage Design & Implementation

**Feature**: 008-homepage-design
**Branch**: 008-homepage-design
**Date**: 2026-01-05
**Status**: ✅ COMPLETE - All 46 tasks implemented

## Overview

This document contains all tasks required to implement the homepage feature. Tasks are organized by user story and follow a strict checklist format for independent implementation and testing.

## Dependencies

### User Story Completion Order
1. **Setup Phase** (Phase 1) → **Foundational Phase** (Phase 2)
2. **US2** (Hero) → Independent
3. **US1** (Features) → Independent
4. **US5** (Navbar) → Independent (requires auth integration)
5. **US3** (Tech Stack) → Independent
6. **US4** (Footer) → Independent
7. **US6** (Design Consistency) → Cross-cutting (verify all components)

### Parallel Execution Opportunities
- **US1, US2, US5**: Can be implemented in parallel (different component files)
- **US3, US4**: Can be implemented in parallel (different sections)
- **US6**: Verification tasks can run in parallel after all components are built

## Phase 1: Setup (Project Initialization)

- [X] T001 Create directory structure for homepage components
  - Create: `phase-2/frontend/src/components/home/`
  - Create: `phase-2/frontend/src/motion/`
  - Create: `phase-2/frontend/src/hooks/`
  - Verify: `phase-2/frontend/src/components/ui/` exists

- [X] T002 Verify existing dependencies are installed
  - Check: `framer-motion` package
  - Check: `lucide-react` package
  - Check: `better-auth` client configuration
  - Verify: `tailwindcss` configuration includes custom colors

- [X] T003 Create animation patterns file
  - File: `phase-2/frontend/src/motion/patterns.ts`
  - Implement: `fadeInUp` variant
  - Implement: `lineDraw` variant
  - Implement: `hoverScale` constant
  - Verify: All use custom easing curve `[0.22, 1, 0.36, 1]`

- [X] T004 Create auth state hook
  - File: `phase-2/frontend/src/hooks/use-auth-state.ts`
  - Implement: `useAuthState()` hook
  - Integrate: Better Auth `useSession()` client
  - Return: Session state, loading, error handling

## Phase 2: Foundational (Shared Components)

- [X] T005 [P] Create Button component
  - File: `phase-2/frontend/src/components/ui/Button.tsx`
  - Implement: 4 variants (primary, secondary, ghost, technical)
  - Implement: 3 sizes (sm, md, lg)
  - Add: Framer Motion `motion.button` wrapper
  - Add: Hover scale (1.02) and tap scale (0.98)
  - Verify: Custom easing curve for transitions

- [X] T006 [P] Create Card component
  - File: `phase-2/frontend/src/components/ui/Card.tsx`
  - Implement: 3 variants (feature, tech, interactive)
  - Implement: 3 border styles (none, technical, accent)
  - Add: Optional hover effects
  - Add: `motion.div` with `fadeInUp` and `hoverScale`
  - Verify: Background color `#F9F7F2`

## Phase 3: User Story 2 - Hero Section (P1)

**Goal**: Display main headline and CTAs with animated entrance

**Independent Test**: Verify hero content appears immediately with clear messaging

- [X] T007 [P] [US2] Create HeroSection component
  - File: `phase-2/frontend/src/components/home/hero-section.tsx`
  - Implement: Props interface (headline, subtext, ctaPrimary, ctaSecondary, callbacks)
  - Add: Support for HTML attributes (id, className) via React.HTMLAttributes
  - Add: Technical line decorations (top 1/3, top 2/3)
  - Add: Right column visual component (`task-split-editor.tsx`)
  - Verify: Typography hierarchy (serif headline, sans subtext)

- [X] T008 [US2] Implement HeroSection animations
  - Headline: `fadeInUp` variant (0.8s duration)
  - Subtext: `fadeInUp` variant (1.0s delay)
  - Buttons: `fadeInUp` variant (1.2s delay, staggered 0.1s)
  - Verify: All use `[0.22, 1, 0.36, 1]` easing

- [X] T009 [US2] Create HeroSection data structure
  - File: `phase-2/frontend/src/app/page.tsx` (inline data)
  - Define: Headline "PRODUCTIVITY MEETS INTELLIGENCE"
  - Define: Subtext "A modern task management platform designed for clarity, focus, and productivity."
  - Define: CTA labels "GET STARTED", "SOURCE CODE"
  - Define: Click handlers (/tasks route, GitHub repo in new tab)
  - Add: id="hero" for smooth scroll navigation

- [X] T010 [US2] Test HeroSection independently
  - Render: Component in isolation
  - Verify: All text content displays correctly (headline, subtext, button labels)
  - Verify: "GET STARTED" button routes to /tasks
  - Verify: "SOURCE CODE" button opens GitHub repo in new tab
  - Verify: Right column displays task-split-editor.tsx
  - Verify: Animations run smoothly (60fps)
  - Test: Mobile responsiveness (stacked layout)
  - Verify: id="hero" prop is passed for smooth scroll

## Phase 4: User Story 1 - Core Features Section (P1)

**Goal**: Display 3 feature cards with hover interactions

**Independent Test**: Verify 3 distinct cards display with clear value propositions

- [X] T011 [P] [US1] Create FeaturesGrid component
  - File: `phase-2/frontend/src/components/home/features-grid.tsx`
  - Implement: Props interface (features array, heading, subtitle)
  - Add: Grid layout (1 column mobile, 3 columns desktop)
  - Verify: Exactly 3 feature cards required

- [X] T012 [US1] Create FeatureCard subcomponent
  - File: `phase-2/frontend/src/components/home/features-grid.tsx` (internal)
  - Implement: Icon rendering (Zap, Cloud, Shield from lucide-react)
  - Implement: Title and description display
  - Add: Technical border styling

- [X] T013 [US1] Implement FeaturesGrid animations
  - Container: `staggerContainer` (0.1s delay between items)
  - Each card: `fadeInUp` + `hoverScale` (1.02)
  - Icons: Subtle rotation on hover (5 degrees)
  - Verify: Staggered entrance cascade

- [X] T014 [US1] Create FeaturesGrid data structure
  - File: `phase-2/frontend/src/app/page.tsx` (inline data)
  - Define: Heading "Core Features", subtitle "Built for Focus"
  - Define: Card 1 - "Zero Distractions" + description + Zap icon
  - Define: Card 2 - "Lightning Sync" + description + Cloud icon
  - Define: Card 3 - "Secure by Default" + description + Shield icon
  - Verify: All descriptions are meaningful

- [X] T015 [US1] Test FeaturesGrid independently
  - Render: Component in isolation
  - Verify: 3 cards display with correct content
  - Verify: Hover effects work (scale, border color)
  - Verify: Staggered animations on load
  - Test: Mobile grid (1 column) vs desktop (3 columns)

## Phase 5: User Story 5 - Navbar with State Management (P1)

**Goal**: Responsive navbar that adapts to authentication state

**Independent Test**: Verify correct UI for logged-in vs logged-out states

- [X] T016 [P] [US5] Create NavBar component
  - File: `phase-2/frontend/src/components/home/nav-bar.tsx`
  - Implement: Props interface (brandName, navigationLinks, authActions)
  - Add: Sticky positioning with scroll detection
  - Add: Mobile hamburger menu toggle

- [X] T017 [US5] Implement auth state integration
  - Use: `useAuthState()` hook from T004
  - Conditional: Logged-out view (Sign In, Get Started buttons)
  - Conditional: Logged-in view (user name, Profile link, Tasks link)
  - Loading: Skeleton state during auth resolution

- [X] T018 [US5] Create desktop navigation
  - Left: Brand name (serif font)
  - Middle: Navigation links (only when authenticated)
  - Right: Auth actions (conditional)
  - Verify: Proper spacing and alignment

- [X] T019 [US5] Create mobile navigation
  - Hamburger menu toggle (Menu/X icons)
  - Slide-down animation for dropdown
  - Stack auth actions vertically
  - Verify: Mobile menu closes on link click

- [X] T020 [US5] Implement navbar animations
  - Brand: Initial slide-in from left
  - Auth actions: `fadeInUp` when state changes
  - Mobile menu: Slide-down with `fadeInUp`
  - Hover: Scale 1.02 on links

- [X] T021 [US5] Create NavBar data structure
  - File: `phase-2/frontend/src/app/page.tsx` (inline data)
  - Define: Brand name "TaskStack"
  - Define: Navigation links (Tasks only - Profile removed to avoid duplicate)
  - Define: Auth actions (Sign In → /login, Get Started → /signup, /profile)
  - Verify: All routes are valid

- [X] T022 [US5] Test NavBar independently
  - Test: Logged-out state (Sign In, Get Started visible)
  - Test: Logged-in state (user name, Tasks, Profile visible)
  - Test: Mobile menu toggle
  - Test: Scroll behavior (sticky, background change)
  - Test: Auth state transitions (simulate loading)

## Phase 6: User Story 3 - Tech Stack Section (P2)

**Goal**: Display technology stack with technical separators

**Independent Test**: Verify all 4 technologies display with descriptions

- [X] T023 [P] [US3] Create TechStack component
  - File: `phase-2/frontend/src/components/home/tech-stack.tsx`
  - Implement: Props interface (heading, technologies, separator)
  - Add: Flex layout (row on desktop, column on mobile)
  - Verify: 4 technology items required

- [X] T024 [US3] Implement TechItem rendering
  - Icons: Code, Server, Database, Lock (lucide-react)
  - Names: Next.js 16+, FastAPI, Neon, Better Auth
  - Descriptions: Meaningful technical descriptions
  - Optional: External links

- [X] T025 [US3] Add technical separators
  - Style: 1px lines between items (desktop only)
  - Animation: `lineDraw` with 1.2s duration
  - Viewport: Only animate when in view
  - Verify: No separator on last item

- [X] T026 [US3] Implement TechStack animations
  - Items: `fadeInUp` with 0.15s stagger
  - Separators: `lineDraw` (1.2s duration)
  - Hover: Scale 1.01 + color accent
  - Verify: Smooth entrance cascade

- [X] T027 [US3] Create TechStack data structure
  - File: `phase-2/frontend/src/app/page.tsx` (inline data)
  - Define: Heading "Modern Technical Stack"
  - Define: 4 technology objects with name, description, icon, link
  - Verify: All descriptions are accurate

- [X] T028 [US3] Test TechStack independently
  - Render: Component in isolation
  - Verify: 4 items display with correct content
  - Verify: Separators appear between items (desktop)
  - Verify: Mobile layout (vertical stack)
  - Test: Hover effects on items

## Phase 7: User Story 4 - Footer Section (P2)

**Goal**: Display footer with navigation, social links, and copyright

**Independent Test**: Verify footer content and link functionality

- [X] T029 [P] [US4] Create Footer component
  - File: `phase-2/frontend/src/components/home/footer.tsx`
  - Implement: Props interface (brandName, navigation, social, copyright)
  - Add: smoothScrollTo() function for hash-based navigation
  - Add: 4-column grid for navigation (desktop)
  - Add: Bottom bar with brand and social links
  - Add: Link type detection (hash, external, internal)

- [X] T030 [US4] Implement navigation grid
  - Columns: Features, LinkedIn, Docs, About
  - Style: Uppercase mono labels (opacity 60%)
  - Links: Hover color change to orange (#FF6B4A)
  - Features: Smooth scroll to #features section
  - LinkedIn: Opens external profile in new tab
  - Docs: Opens GitHub repo in new tab
  - About: Smooth scroll to #hero section
  - Verify: Clickable and functional with proper routing

- [X] T031 [US4] Implement bottom bar
  - Brand: Massive serif text (15vw desktop, 10vw mobile)
  - Social: X, LinkedIn, GitHub icons
  - Copyright: Text with proper formatting
  - Layout: Flex column (mobile) / row (desktop)

- [X] T032 [US4] Add footer hover interactions
  - Links: Color transition to #FF6B4A (0.3s)
  - Social icons: Scale to 1.1 on hover
  - Verify: No entrance animations (loads with page)

- [X] T033 [US4] Create Footer data structure
  - File: `phase-2/frontend/src/app/page.tsx` (inline data)
  - Define: Brand name "TaskStack"
  - Define: 4 navigation items: Features (#features), LinkedIn (external), Docs (external), About (#hero)
  - Define: Social links with personal URLs (LinkedIn profile, GitHub repo)
  - Define: Copyright text "© 2025 TaskStack. All rights reserved."
  - Implement: smoothScrollTo() function for hash-based navigation
  - Verify: External links open in new tabs with security attributes

- [X] T034 [US4] Test Footer independently
  - Render: Component in isolation
  - Verify: All navigation links display
  - Verify: Social icons render correctly
  - Verify: Hover effects work
  - Test: Mobile responsiveness (stacked layout)

## Phase 8: User Story 6 - Visual Consistency (P3)

**Goal**: Verify all components follow design system

**Independent Test**: Verify consistent colors, typography, and spacing

- [X] T035 [US6] Verify color palette compliance
  - Check: All components use #F9F7F2 (cream background)
  - Check: All components use #FF6B4A (orange accent)
  - Check: All components use #2A1B12 (espresso text)
  - Verify: No pure white (#FFFFFF) used

- [X] T036 [US6] Verify typography compliance
  - Headings: Playfair Display / Young Serif (serif)
  - Body: DM Sans / Inter (sans-serif)
  - Labels: JetBrains Mono (monospace)
  - Verify: No system default fonts

- [X] T037 [US6] Verify animation compliance
  - All: Use custom easing `[0.22, 1, 0.36, 1]`
  - No: Bouncy springs (damping < 30)
  - No: Linear transitions
  - All: GPU-accelerated transforms only

- [X] T038 [US6] Verify spacing consistency
  - Check: 4px grid system usage
  - Check: Proper padding (p-6, p-8) on sections
  - Check: Container max-width (max-w-7xl)
  - Verify: Mobile-first responsive design

- [X] T039 [US6] Verify component integration
  - Check: All components render in page.tsx
  - Check: Props flow correctly
  - Check: Auth state propagates properly
  - Verify: No TypeScript errors

## Phase 9: Integration & Final Assembly

- [X] T040 [P] Create main homepage file
  - File: `phase-2/frontend/src/app/page.tsx`
  - Import: All 5 homepage components
  - Import: All data structures
  - Assemble: Component hierarchy (NavBar → Hero → Features → Tech → Footer)
  - Add: Scroll progress indicator (4 dots + back-to-top button)
  - Verify: Server component with client children

- [X] T041 [P] Create auth provider wrapper
  - File: `phase-2/frontend/src/app/layout.tsx` (if needed)
  - Wrap: Homepage with AuthProvider
  - Verify: Proper client boundary

- [X] T042 [US1, US2, US3, US4, US5, US6] Run integration tests
  - Test: All components render together
  - Test: Page load performance (<2s)
  - Test: Auth state transitions
  - Test: Responsive breakpoints (mobile, tablet, desktop)
  - Test: Accessibility (ARIA labels, keyboard nav)
  - Test: Scroll progress dots fill correctly
  - Test: Back-to-top button appears/disappears at 500px

## Phase 10: Polish & Cross-Cutting Concerns

- [X] T043 [P] Performance optimization
  - Implement: Code splitting for components
  - Implement: React Suspense for loading states
  - Verify: Lighthouse score >90
  - Verify: No layout shifts (CLS < 0.1)

- [X] T044 [P] Accessibility audit
  - Check: ARIA labels on interactive elements
  - Check: Keyboard navigation support
  - Check: Color contrast ratios
  - Verify: Screen reader compatibility

- [X] T045 [P] Error handling
  - Add: Error boundaries for components
  - Add: Loading states for auth
  - Add: Fallback UI for failed auth
  - Verify: Graceful degradation

- [X] T046 [P] Final validation
  - Run: All component tests
  - Run: All E2E tests
  - Verify: Success criteria (SC-001 to SC-010)
  - Verify: Design system compliance

## Summary

### ✅ Task Completion Status
- **Total**: 46/46 tasks ✅ COMPLETE
- **Setup**: 4/4 tasks ✅
- **Foundational**: 2/2 tasks ✅
- **US2 (Hero)**: 4/4 tasks ✅
- **US1 (Features)**: 5/5 tasks ✅
- **US5 (Navbar)**: 7/7 tasks ✅
- **US3 (Tech Stack)**: 6/6 tasks ✅
- **US4 (Footer)**: 6/6 tasks ✅
- **US6 (Consistency)**: 5/5 tasks ✅
- **Integration**: 3/3 tasks ✅
- **Polish**: 4/4 tasks ✅

### Parallel Opportunities
- **High**: US1, US2, US5 (different components)
- **Medium**: US3, US4 (different sections)
- **Low**: US6 (verification only)

### MVP Scope
**Recommended**: Complete Phase 1-3 (Setup + Foundational + US2 Hero)
- Delivers: Working hero section with animations
- Validates: Design system, animation patterns, basic structure
- **Time**: ~1-2 hours

### Full Implementation
**Complete**: All phases (1-10)
- Delivers: Full homepage with all 5 components
- Validates: All user stories, design compliance, performance
- **Time**: ~3-4 hours

### Testing Strategy
- **Component Tests**: Each phase has independent test criteria
- **E2E Tests**: Integration phase (T042) covers full flow
- **Performance**: Phase 10 validation (T043)
- **Accessibility**: Phase 10 audit (T044)

---

**✅ IMPLEMENTATION COMPLETE**: All 46 tasks have been successfully implemented and tested. The homepage feature is production-ready.

### Implementation Summary
- **Build Status**: ✅ PASSED (Next.js 16.1.1)
- **TypeScript**: ✅ ZERO ERRORS
- **Design System**: ✅ FULL COMPLIANCE
- **Performance**: ✅ OPTIMIZED
- **Accessibility**: ✅ AUDITED

### Key Features Implemented
- **Branding**: TaskStack (updated from TaskFlow)
- **Hero Section**: "PRODUCTIVITY MEETS INTELLIGENCE" headline with split-screen editor
- **Navigation**: Smooth scroll to #features and #hero sections
- **External Links**: LinkedIn profile and GitHub repo integration
- **Footer**: Editorial design with technical line accents and smooth scroll functionality
- **Scroll Progress**: 4-dot indicator + back-to-top button for enhanced UX

### Files Created/Modified
- 5 new components in `src/components/home/` (including task-split-editor.tsx)
- 2 infrastructure files in `src/motion/` and `src/hooks/`
- 2 enhanced UI components (Button, Card)
- 1 main homepage integration file
- Updated: Navbar, Footer, Hero components with new branding

### Ready for Production
Run `cd phase-2/frontend && npm run dev` to view the complete homepage with all 5 sections, smooth scroll navigation, animations, and auth state integration.