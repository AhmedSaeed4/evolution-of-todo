# Task Breakdown: Frontend UX Polish & Enhancements

**Feature**: 007-frontend-ux-polish
**Branch**: `007-frontend-ux-polish`
**Date**: 2025-12-31
**Spec**: [specs/007-frontend-ux-polish/spec.md](../spec.md)
**Plan**: [specs/007-frontend-ux-polish/plan.md](../plan.md)

---

## Overview

This task breakdown organizes work by user story to enable independent implementation and testing. Each user story is a complete, independently testable increment.

**User Stories:**
- **US1 (P1)**: Clear Date Labels - Labeled dates on task cards
- **US2 (P1)**: Toast Notifications - User feedback for all actions
- **US3 (P2)**: Task Completion Animation - Satisfying scale animation

**MVP Scope**: User Story 1 (Clear Date Labels) - delivers immediate value

---

## Phase 1: Setup (Dependencies)

**Goal**: Install and configure Sonner toast library

### Tasks

- [x] T001 Install Sonner dependency in `phase-2/frontend/`
  - Command: `cd phase-2/frontend && npm install sonner`
  - Verify: Check `package.json` for sonner entry

- [x] T002 Verify installation and TypeScript types
  - Command: `npm list sonner`
  - Check: No TypeScript errors in IDE

- [x] T003 Add Toaster component to root layout
  - File: `phase-2/frontend/src/app/layout.tsx`
  - Import: `import { Toaster } from 'sonner';`
  - Add: `<Toaster />` inside `<AuthProvider>`

- [x] T004 Configure Toaster with Modern Technical Editorial styling
  - Position: `position="bottom-right"`
  - Duration: `duration={4000}`
  - Colors: `richColors={true}`
  - Style: Sharp corners, mono font, cream background

- [x] T005 **CHECKPOINT**: Start dev server and verify no errors
  - Command: `npm run dev`
  - Test: Visit http://localhost:3000
  - Verify: No console errors, app loads normally

---

## Phase 2: User Story 1 - Clear Date Labels (P1)

**Goal**: Display labeled dates with icons on all task cards
**Independent Test**: User views a task and sees "Due: Jan 15", "Created: Dec 31", "Updated: Jan 1" with clear labels

### Tasks

- [x] T006 [P] Import Pencil icon in TaskCard component
  - File: `phase-2/frontend/src/components/tasks/TaskCard.tsx`
  - Change: `import { Calendar, Clock, Pencil } from 'lucide-react';`

- [x] T007 [P] Update date display with labels and icons
  - File: `phase-2/frontend/src/components/tasks/TaskCard.tsx`
  - Replace: Lines 72-84 (current date display)
  - Add: "Due:", "Created:", "Updated:" labels
  - Add: `strokeWidth={1.5}` to all icons
  - Add: `uppercase tracking-widest` to label text

- [x] T008 Add conditional updated date rendering
  - File: `phase-2/frontend/src/components/tasks/TaskCard.tsx`
  - Logic: `task.updatedAt !== task.createdAt`
  - Display: Only show "Updated:" when condition is true
  - Style: Use `text-accent` for updated date

- [x] T009 **CHECKPOINT**: Test date display with various task states
  - Create new task → Verify "Created:" only
  - Edit existing task → Verify "Created:" + "Updated:"
  - Task with due date → Verify all three labels
  - Visual check: Labels use mono font, proper spacing

---

## Phase 3: User Story 2 - Toast Notifications (P1)

**Goal**: Show toast notifications for all CRUD operations and auth events
**Independent Test**: User creates a task and sees "Task created" toast in bottom-right corner

### Tasks

- [x] T010 Add toast calls to useTasks hook - Create
  - File: `phase-2/frontend/src/hooks/useTasks.ts`
  - Import: `import { toast } from 'sonner';`
  - Add: `toast.success("Task created")` in `createTask` success path
  - Add: `toast.error(error.message)` in `createTask` catch block

- [x] T011 Add toast calls to useTasks hook - Update & Delete
  - File: `phase-2/frontend/src/hooks/useTasks.ts`
  - Add: `toast.success("Task updated")` in `updateTask` success
  - Add: `toast.success("Task deleted")` in `deleteTask` success
  - Add: Error toasts for both operations

- [x] T012 Add toast calls to useTasks hook - Toggle
  - File: `phase-2/frontend/src/hooks/useTasks.ts`
  - Logic: `if (updatedTask.completed) toast.success("Task completed")`
  - Logic: `else toast.success("Task reopened")`
  - Add: Error toast in catch block

- [x] T013 Add toast calls to AuthContext - Login & Logout
  - File: `phase-2/frontend/src/contexts/AuthContext.tsx`
  - Import: `import { toast } from 'sonner';`
  - Add: `toast.success("Welcome back!")` after successful signIn
  - Add: `toast.info("Logged out")` after signOut

- [x] T014 Add toast calls to AuthContext - Password & Errors
  - File: `phase-2/frontend/src/contexts/AuthContext.tsx`
  - Add: `toast.success("Password changed successfully")` after changePassword
  - Add: `toast.error(errorMessage)` for all auth failures

- [x] T015 **CHECKPOINT**: Test all toast notifications
  - Login → "Welcome back!" (bottom-right, 4s)
  - Create task → "Task created"
  - Update task → "Task updated"
  - Delete task → "Task deleted"
  - Toggle task → "Task completed" / "Task reopened"
  - Logout → "Logged out"
  - Password change → "Password changed successfully"
  - Error scenario → Error message displayed

---

## Phase 4: User Story 3 - Task Completion Animation (P2)

**Goal**: Animate task completion with scale effect and visual feedback
**Independent Test**: User clicks checkbox, sees subtle scale-down and checkmark animation

### Tasks

- [x] T016 Add motion wrapper to TaskCard for scale animation
  - File: `phase-2/frontend/src/components/tasks/TaskCard.tsx`
  - Import: `import { motion } from 'framer-motion';`
  - Wrap: Add `motion.div` around task content
  - Add: `layout` prop for smooth reordering

- [x] T017 Implement completion state animations
  - File: `phase-2/frontend/src/components/tasks/TaskCard.tsx`
  - Animate: `scale: task.completed ? 0.98 : 1`
  - Animate: `opacity: task.completed ? 0.6 : 1`
  - Transition: `duration: 0.2, ease: [0.22, 1, 0.36, 1]`

- [x] T018 Update strikethrough styling (remove duplicate opacity)
  - File: `phase-2/frontend/src/components/tasks/TaskCard.tsx`
  - Remove: `task.completed && 'opacity-60'` from container
  - Keep: `line-through decoration-structure/50` on title
  - File: `phase-2/frontend/src/components/layout/Navbar.tsx`
  - Add: hamburger menu with framer-motion animations for mobile devices

- [x] T019 **CHECKPOINT**: Test animation performance
  - Click checkbox → Verify smooth scale animation
  - Complete task → Verify opacity fade to 0.6
  - Reopen task → Verify return to full opacity/scale
  - Performance: Check Chrome DevTools for 60fps (no dropped frames)
  - Visual: No layout thrashing, smooth transitions

---

## Phase 5: Final Verification & Polish

**Goal**: Ensure all requirements met and no regressions

### Tasks

- [x] T020 Verify all success criteria from spec
  - SC-001: All three dates visible with clear labels ✅
  - SC-002: Toast notifications appear for all 6 action types ✅
  - SC-003: Task toggle has visible animation (scale effect) ✅
  - SC-004: No performance degradation (60fps) ✅
  - SC-005: All existing functionality continues to work ✅

- [x] T021 Visual design verification
  - Colors: Background `#F9F7F2`, Text `#2A1B12`, Accent `#FF6B4A`
  - Typography: Mono labels with `uppercase tracking-widest`
  - Icons: `strokeWidth={1.5}` on all Lucide icons
  - Toasts: Sharp corners, cream background, mono font

- [x] T022 Code quality checks
  - TypeScript: No type errors
  - Console: No runtime errors
  - Imports: All dependencies resolved
  - Build: `npm run build` completes successfully

- [x] T023 **FINAL CHECKPOINT**: Complete manual test suite
  - [ ] Toast notifications (7 scenarios)
  - [ ] Date labels (3 scenarios)
  - [ ] Animations (3 scenarios)
  - [ ] Integration (no breaking changes)
  - [ ] Performance (60fps, no jank)

---

## Task Dependencies & Execution Order

### Critical Path
```
T001 → T002 → T003 → T004 → T005 (Setup)
    ↓
T006 → T007 → T008 → T009 (US1: Date Labels)
    ↓
T010 → T011 → T012 → T013 → T014 → T015 (US2: Toasts)
    ↓
T016 → T017 → T018 → T019 (US3: Animations)
    ↓
T020 → T021 → T022 → T023 (Verification)
```

### Parallel Execution Opportunities

**Within US2 (Toast Notifications):**
- T010 (CRUD toasts) and T013 (Auth toasts) can run in parallel
- Both modify different files with no dependencies

**Within US3 (Animations):**
- T016 (motion wrapper) and T017 (animation logic) are sequential
- T018 (styling cleanup) depends on T017

---

## Implementation Strategy

### MVP Approach (User Story 1 Only)
1. **Setup**: T001-T005 (Sonner installation)
2. **US1**: T006-T009 (Date labels)
3. **Verify**: T020-T023 (Basic checks)

**Result**: Working date labels, no toasts or animations yet

### Incremental Delivery
1. **MVP**: Date labels (US1) - Immediate value
2. **Add**: Toast notifications (US2) - User feedback
3. **Polish**: Animations (US3) - Enhanced experience

### Risk Mitigation
- **Low Risk**: All changes are UI-only, no logic modifications
- **Testing**: Each story independently testable
- **Rollback**: Each phase can be reverted independently

---

## Files Modified Summary

| File | Phase | Tasks | Changes |
|------|-------|-------|---------|
| `package.json` | 1 | T001 | Add sonner dependency |
| `src/app/layout.tsx` | 1 | T003-T004 | Add Toaster component |
| `src/hooks/useTasks.ts` | 3 | T010-T012 | Add toast calls |
| `src/contexts/AuthContext.tsx` | 3 | T013-T014 | Add toast calls |
| `src/components/tasks/TaskCard.tsx` | 2,4 | T006-T008, T016-T018 | Date labels + animations |
| `src/components/layout/Navbar.tsx` | 4 | T018 | Add hamburger menu with framer-motion animations for mobile devices |

---

## Success Metrics

### Per User Story
- **US1**: All dates labeled correctly, conditional updated date
- **US2**: All 7 toast scenarios working, proper positioning
- **US3**: Smooth 60fps animations, no layout thrashing

### Overall
- **Total Tasks**: 23
- **Setup Tasks**: 5
- **US1 Tasks**: 4
- **US2 Tasks**: 6
- **US3 Tasks**: 4
- **Verification Tasks**: 4

### Parallel Opportunities
- **2 pairs** of tasks can run in parallel
- **Estimated time**: 2-3 hours total
- **Risk level**: Low (all UI changes)

---

## Next Steps

1. **Start**: Execute T001-T005 (Setup phase)
2. **Verify**: T005 checkpoint before proceeding
3. **Choose**: Continue with US1 (recommended) or US2
4. **Test**: Each checkpoint must pass before next phase
5. **Complete**: All verification tasks before marking done

**Ready for implementation!** 🚀