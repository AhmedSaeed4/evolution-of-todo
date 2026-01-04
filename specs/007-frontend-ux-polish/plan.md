# Implementation Plan: Frontend UX Polish & Enhancements

**Branch**: `007-frontend-ux-polish` | **Date**: 2025-12-31 | **Spec**: [specs/007-frontend-ux-polish/spec.md](../spec.md)
**Input**: Feature specification from `/specs/007-frontend-ux-polish/spec.md`
**Constitution**: v1.1.0 compliance verified

## Summary

Add UX polish to the Next.js frontend: labeled date display, Sonner toast notifications, and Framer Motion animations for task completion. This feature enhances user feedback and visual polish without altering core functionality or violating constitution principles.

**Key Deliverables:**
- ✅ Toast notifications for all CRUD operations and auth events
- ✅ Enhanced date display with labels and icons
- ✅ Task completion animations with scale effects
- ✅ Modern Technical Editorial aesthetic throughout

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.3, Next.js 16.1.1 (App Router)
**Primary Dependencies**:
- `framer-motion`: ^12.23.26 (existing, for animations)
- `lucide-react`: ^0.562.0 (existing, for icons)
- `sonner`: ^2.0.0 (new, for toast notifications)

**Storage**: N/A (frontend-only feature)
**Testing**: Manual verification (toast timing, animation performance, visual regression)
**Target Platform**: Next.js 16+ web application (App Router)
**Project Type**: Web application (Phase II frontend)
**Performance Goals**: 60fps animations, <2.9kb bundle impact from Sonner
**Constraints**:
- No breaking changes to existing APIs
- Maintain existing component structure
- Follow Modern Technical Editorial aesthetic
- Preserve constitution compliance

**Scale/Scope**:
- 4 component modifications (TaskCard, layout, useTasks, AuthContext)
- 1 new dependency (Sonner)
- 3 user stories (2 P1, 1 P2)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- ✅ **I. Universal Logic Decoupling**: Toast calls added to hooks, not business logic. Presentation layer only.
- ✅ **II. AI-Native Interoperability**: Frontend-only feature, no MCP changes required.
- ✅ **III. Strict Statelessness**: Toasts are ephemeral UI feedback, no session storage.
- ✅ **IV. Event-Driven Decoupling**: Not applicable (frontend-only, no async operations).
- ✅ **V. Zero-Trust Multi-Tenancy**: No data access changes, existing auth patterns maintained.
- ✅ **VI. Technology Stack**: Sonner is authorized (modern, lightweight React library).
- ✅ **VII. Security**: No secrets, no input validation changes, JWT patterns unchanged.
- ✅ **VIII. Observability**: Toasts provide user-level feedback, no logging changes needed.

**CONSTITUTION GATE: PASSED ✅**
No violations requiring ADR. All changes are UI/UX enhancements within existing architecture.

## Project Structure

### Documentation (this feature)

```text
specs/007-frontend-ux-polish/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Technology decisions & rationale
├── data-model.md        # Phase 1 output - Will be generated
├── quickstart.md        # Phase 1 output - Will be generated
├── contracts/           # Phase 1 output - Will be generated
└── tasks.md             # Phase 2 output - (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-2/frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # ← Add Toaster component
│   │   ├── globals.css
│   │   └── (auth)/, (dashboard)/
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx             # ← Add date labels, animations
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   └── TaskFilters.tsx
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   └── Checkbox.tsx
│   │   └── layout/
│   │       └── Navbar.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx              # ← Add toast calls on auth events
│   ├── hooks/
│   │   ├── useTasks.ts                  # ← Add toast calls on CRUD
│   │   ├── useFilters.ts
│   │   └── useAuth.ts
│   ├── motion/
│   │   └── variants.ts                  # Existing animation patterns
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts                     # Task, User types
├── package.json                         # ← Add sonner dependency
└── tsconfig.json
```

**Structure Decision**: Web application structure (Option 2 from template). All changes are contained within the existing Next.js frontend architecture. No new directories or structural changes required.

## Complexity Tracking

> **Filled ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All gates passed* | *N/A* |

**No constitutional violations requiring justification or ADR.**

## Implementation Phases

### Phase 1: Foundation & Toast Integration (P1)
1. **Install Sonner**: `npm install sonner`
2. **Setup Toaster**: Add `<Toaster />` to root layout.tsx
3. **useTasks.ts**: Add toast calls to CRUD operations
4. **AuthContext.tsx**: Add toast calls to auth events

### Phase 2: UI Enhancements (P1)
1. **TaskCard.tsx**: Update date display with labels
2. **TaskCard.tsx**: Import and use Pencil icon
3. **TaskCard.tsx**: Conditional updated date rendering

### Phase 3: Animations (P2)
1. **TaskCard.tsx**: Add motion wrapper for scale effect
2. **TaskCard.tsx**: Implement completion state animations
3. **Performance**: Verify 60fps, no layout thrashing

## Dependencies Summary

### New Dependencies
| Package | Version | Purpose | Bundle Impact | Justification |
|---------|---------|---------|---------------|---------------|
| `sonner` | ^2.0.0 | Toast notifications | ~2.9kb gzipped | Lightweight, modern, matches all FRs |

### Existing Dependencies Used
| Package | Current Version | Usage | Constitution Compliance |
|---------|-----------------|-------|------------------------|
| `framer-motion` | ^12.23.26 | Task completion animation | ✅ Authorized |
| `lucide-react` | ^0.562.0 | Pencil icon for updated dates | ✅ Authorized |
| `next` | 16.1.1 | App Router layout | ✅ Authorized |
| `typescript` | ^5 | Type safety | ✅ Authorized |

## Risk Assessment

### Low Risk Changes
- ✅ **Sonner installation**: Standard npm package, well-tested
- ✅ **Toaster in layout**: Single component addition, non-breaking
- ✅ **Date labels**: UI-only enhancement, no logic changes
- ✅ **Toast calls**: Non-breaking additions to existing functions

### Medium Risk Changes
- ⚠️ **Task animation**: Requires performance testing
- ⚠️ **State synchronization**: Ensure toast timing matches UI updates

### Mitigation Strategies
- Use existing Framer Motion patterns from motion/variants.ts
- Test animation performance with Chrome DevTools
- Verify toast timing doesn't conflict with state updates
- Maintain existing component API surface
- Follow established Modern Technical Editorial aesthetic

## Testing Strategy

### Manual Testing Plan
1. **Toast Notifications**: Verify all 6 action types trigger correct toasts
   - Login → "Welcome back!"
   - Create task → "Task created"
   - Update task → "Task updated"
   - Delete task → "Task deleted"
   - Toggle task → "Task completed" / "Task reopened"
   - Logout → "Logged out"
   - Password change → "Password changed successfully"

2. **Date Labels**: Check conditional rendering
   - New task: Shows "Created:", no "Updated:"
   - Edited task: Shows both "Created:" and "Updated:"

3. **Animations**: Verify performance
   - Smooth scale effect on checkbox click
   - 60fps performance (no dropped frames)
   - No layout thrashing

4. **Integration**: Ensure no breaking changes
   - Existing functionality unchanged
   - No console errors
   - No TypeScript errors

### Performance Validation
- Chrome DevTools Performance tab for animation profiling
- Bundle analyzer for Sonner impact verification
- Lighthouse for overall performance check

## Success Criteria (from Spec)

- ✅ **SC-001**: All three dates visible with clear labels on task cards
- ✅ **SC-002**: Toast notifications appear for all 6 action types
- ✅ **SC-003**: Task toggle has visible animation (scale effect)
- ✅ **SC-004**: No performance degradation (no jank, smooth 60fps)
- ✅ **SC-005**: All existing functionality continues to work

## Next Steps

**Ready for Phase 1: Design & Contracts**

1. Generate `data-model.md` (minimal - UI state only)
2. Generate `quickstart.md` (installation & setup guide)
3. Create `contracts/` directory (not needed - frontend-only)
4. Proceed to `/sp.tasks` for detailed implementation tasks

**Estimated Effort**: 2-3 hours for full implementation
**Risk Level**: Low
**Constitution Compliance**: 100% ✅

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
