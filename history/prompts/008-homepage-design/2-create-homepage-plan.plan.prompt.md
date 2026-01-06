---
id: 2
title: Create homepage implementation plan
stage: plan
date: 2026-01-05
surface: agent
model: claude-opus-4-5-20251101
feature: homepage-design
branch: 008-homepage-design
user: User
command: /sp.plan

### 1. Core Features Section
- **Purpose**: Display three key platform capabilities
- **Structure**: Grid layout with three cards
- **Features**: Zero Distractions, Lightning Sync, Secure by Default
- **Interaction**: Hover effects with visual feedback

### 2. Hero Section
- **Purpose**: Primary value proposition and first impression
- **Structure**: Two-column layout (text left, visual right)
- **Content**: "MASTER YOUR TASKS TODAY" headline, descriptive subtext
- **Actions**: Two primary buttons (Start Free Trial, Watch Demo)
- **Right Column**: Interactive task-split-editor component showing code typing and live preview

### 3. Modern Technical Stack
- **Purpose**: Build credibility through technology transparency
- **Structure**: Horizontal layout with technology items and separators
- **Technologies**: Next.js 16+, FastAPI, Neon, Better Auth
- **Visual**: Technical labels with descriptions

### 4. Footer
- **Purpose**: Compact navigation and legal information
- **Structure**: Two-tier layout (navigation + bottom bar)
- **Navigation**: Features, Pricing, Docs, About links
- **Social**: X, LinkedIn, GitHub icons
- **Legal**: Copyright and rights information

### 5. Home Page Navbar
- **Purpose**: State-managed navigation for home page
- **Structure**: Three-section layout (left: site name, middle: page nav, right: user actions)
- **Left Section**: Site name/logo with brand styling
- **Middle Section**: Two navigation links - "Tasks" page and "Profile" page
- **Right Section**: Dynamic state-based UI:
  - **Logged Out**: "Sign In" and "Get Started" buttons
  - **Logged In**: User name + small icon (profile avatar)
- **State Management**: Must handle authentication state transitions. current structure                                                   phase-2/                    # Next.js Web Frontend + FastAPI Backend
│   ├── frontend/              # Next.js application
│   │   ├── src/app/           # App Router pages
│   │   │   ├── api/           # API routes
│   │   │   │   └── auth/      # Authentication endpoints
│   │   │   │       └── [...all]/route.ts  # Better Auth handler
│   │   ├── src/components/    # React components
│   │   │   ├── profile/       # Profile management components
│   │   │   ├── tasks/         # Task management components
│   │   │   ├── auth/          # Authentication components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── src/lib/           # Utilities and auth
│   │   │   ├── auth.ts        # Client auth config
│   │   │   ├── api.ts         # API client (backend integration)
│   │   │   └── auth-server.ts # Better Auth server config
│   │   ├── src/hooks/         # Custom hooks
│   │   └── src/motion/        # Animation variants

## Response snapshot

✅ **SUCCESS**: Complete implementation plan generated (with path corrections)

**Branch**: `008-homepage-design`
**Plan File**: `/specs/008-homepage-design/plan.md`
**Generated Artifacts**:
- `plan.md` - Main implementation plan with Constitution compliance (✅ UPDATED with correct paths)
- `research.md` - Phase 0 research findings
- `data-model.md` - TypeScript interfaces and data structures
- `contracts/component-api.md` - Component API contracts (✅ UPDATED with correct paths)
- `quickstart.md` - Step-by-step implementation guide (✅ UPDATED with correct paths)

**Key Corrections Made**:
- ✅ Updated all file paths from `frontend/` to `phase-2/frontend/`
- ✅ Clarified separation between new homepage navbar and existing app navbar
- ✅ Updated all import statements and command paths
- ✅ Added explicit note about existing navbar remaining unchanged

## Key Deliverables

### Constitution Compliance
✅ **ALL 8 GATES PASSED** - No violations, ready for implementation
- Logic decoupling: UI components only
- Statelessness: Client-side only
- Technology stack: Authorized Next.js 16+ stack
- Security: Uses existing auth system

### Technical Architecture
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5.x, React 18+
- **Styling**: Tailwind CSS + Design Tokens
- **Animations**: Framer Motion
- **Auth**: Better Auth client integration
- **Icons**: Lucide React

### Component Structure
```
frontend/src/
├── app/page.tsx                    # Main homepage
├── components/
│   ├── home/                       # Homepage components
│   │   ├── hero-section.tsx
│   │   ├── features-grid.tsx
│   │   ├── tech-stack.tsx
│   │   ├── footer.tsx
│   │   └── nav-bar.tsx
│   ├── ui/                         # Shared UI
│   │   ├── button.tsx
│   │   └── card.tsx
├── lib/
│   ├── auth.ts                     # Auth client
│   └── motion-variants.ts          # Animation patterns
├── hooks/
│   └── use-auth-state.ts           # Auth state hook
└── motion/
    └── patterns.ts                 # Animation variants
```

### Performance Targets
- Page load: <2 seconds
- Auth state reflection: <100ms
- Animation FPS: 60fps
- CLS: <0.1

### Testing Strategy
- Component tests: Jest + React Testing Library
- E2E tests: Cypress
- Performance: Lighthouse CI
- Coverage: Auth states, responsiveness, accessibility

## Implementation Timeline
- **Phase 0 (Research)**: Complete ✅
- **Phase 1 (Design)**: Complete ✅
- **Phase 2 (Tasks)**: Ready for `/sp.tasks`
- **Estimated Effort**: 2-3 days

## Next Steps
1. Review plan with team
2. Run `/sp.tasks` to generate detailed task list
3. Begin implementation following quickstart guide
4. Validate against success criteria

## Architecture Decisions Made
1. **Client-side only**: No new backend endpoints required
2. **Auth integration**: Uses existing Better Auth infrastructure
3. **Design system**: Strict adherence to Modern Technical Editorial
4. **Animation patterns**: Staggered loading for performance
5. **Component structure**: Modular, testable, reusable

## Risk Mitigation
- **Performance**: Staggered animations, GPU transforms only
- **Auth state**: Proper loading states, error boundaries
- **Mobile**: Mobile-first responsive design
- **Type safety**: Full TypeScript interfaces for all props

## Quality Assurance
- ✅ Constitution compliance verified
- ✅ All user stories from spec covered
- ✅ Type-safe component contracts defined
- ✅ Performance budgets established
- ✅ Testing strategy documented
- ✅ Quickstart guide provided

## Outcome

- ✅ Impact: Complete implementation plan for 6-component homepage
- 🧪 Tests: Component contracts, validation rules, test scenarios defined
- 📁 Files: 5 artifacts generated in specs/008-homepage-design/
- 🔁 Next prompts: /sp.tasks for detailed task breakdown
- 🧠 Reflection: Plan is comprehensive, constitution-compliant, and ready for implementation. All technical unknowns resolved through research.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All gates passed
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to /sp.tasks for task generation

## Architecture Decision Record (ADR) Suggestion

📋 **Architectural decision detected**: **Modern Technical Editorial Design System with Authentication-Aware Component Architecture**

This decision involves:
- **Design System**: Adopting the Modern Technical Editorial aesthetic (cream #F9F7F2, orange #FF6B4A, typography triad) as the unified visual language
- **Component Architecture**: Building auth-aware components that seamlessly adapt between logged-in/logged-out states without page reloads
- **Performance**: Implementing client-side state management for sub-100ms authentication state reflection

**Why this is significant**:
- Long-term impact on all future UI components and user experience
- Multiple viable approaches considered (traditional SSR vs client-side state vs hybrid)
- Cross-cutting concern affecting design consistency, performance, and user flows

**Trade-offs**:
- **Option A**: Client-side state management (chosen) - Fast UX but requires careful hydration
- **Option B**: Server-side rendering - Simpler but slower state transitions
- **Option C**: Hybrid approach - More complex but optimal for both

Document reasoning and tradeoffs? Run `/sp.adr "Modern Technical Editorial Design System"`