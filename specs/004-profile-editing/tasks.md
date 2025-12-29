# Implementation Tasks: Profile Page Enhancement

**Feature**: Profile Page Enhancement (004-profile-editing)
**Branch**: `004-profile-editing`
**Date**: 2025-12-30
**Spec**: [specs/004-profile-editing/spec.md](../spec.md)
**Plan**: [specs/004-profile-editing/plan.md](../plan.md)

## Summary

This document contains implementation tasks for enhancing the profile page with 5 functional sections. Tasks are organized by user story to enable independent implementation and testing.

## Dependencies

**User Story Completion Order**:
1. **Setup & Skills** (Phase 1-2): Required before all user stories
2. **US1 - Edit Profile Information** (P1): Can be implemented independently
3. **US2 - Change Password** (P2): Can be implemented independently
4. **US3 - View Account Information** (P3): Can be implemented independently
5. **US4 - View Task Statistics** (P3): Can be implemented independently
6. **US5 - Sign Out** (P2): Can be implemented independently
7. **Polish Phase**: Cross-cutting concerns after all stories complete

**Parallel Opportunities**: All user stories (US1-US5) can be implemented in parallel after Phase 2 completes.

## Implementation Strategy

**MVP Scope**: Start with User Story 1 (Edit Profile Information) as it delivers core user value.
**Incremental Delivery**: Each user story is independently testable and delivers value.
**Test Approach**: Manual testing via UI interactions (TDD optional per user request).

---

## Phase 1: Setup & Skill Understanding

*Goal: Understand the design system and prepare the development environment*

### Phase 1 Tasks

- [X] T001 **[UI Design Skill Review]** Read and understand Modern Technical Editorial design system in `.claude/skills/ui-design/CLAUDE.md`. Focus on: color palette (#F9F7F2 background, #FF6B4A accent), typography triad (Playfair/DM Sans/JetBrains Mono), and technical line patterns.

- [X] T002 **[UI Animation Skill Review]** Read and understand motion design language in `.claude/skills/ui-animation/CLAUDE.md`. Focus on: smooth easing curve [0.22, 1, 0.36, 1], FadeInUp pattern, and no-bounce hover rules.

- [X] T003 **[Project Structure]** Verify existing file structure in `phase-2/frontend/src/`. Confirm: `components/ui/`, `hooks/`, `lib/`, `motion/` directories exist and contain expected files.

- [X] T004 **[Dependencies Check]** Run `cd phase-2/frontend && npm list framer-motion lucide-react tailwindcss` to verify all required dependencies are installed.

- [X] T005 **[Design Tokens]** Review `phase-2/frontend/src/app/globals.css` to confirm custom theme tokens are available (background, surface, structure, accent colors).

---

## Phase 2: Foundational Infrastructure

*Goal: Extend API layer and prepare reusable components. Must complete before user stories.*

### Phase 2 Tasks

- [X] T006 **[P] [API Extension]** Add 3 new API methods to `phase-2/frontend/src/lib/api.ts`:
  - `updateProfile(data: { name: string; email: string }): Promise<User>`
  - `changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>`
  - `getTaskStats(): Promise<{ total: number; pending: number; completed: number }>`
  - Use existing mock data patterns from current api.ts

- [X] T007 **[P] [Validation Utils]** Add validation functions to `phase-2/frontend/src/lib/utils.ts`:
  - `validateProfileForm(name: string, email: string): { valid: boolean; errors: string[] }`
  - `validatePasswordForm(current: string, newP: string, confirm: string): { valid: boolean; errors: string[] }`
  - Reuse existing `isValidEmail()` function

- [X] T008 **[P] [Component Directory]** Create `phase-2/frontend/src/components/profile/` directory structure for 5 new components.

---

## Phase 3: User Story 1 - Edit Profile Information (P1)

*Goal: Enable users to edit their name and email with validation and feedback*

**Independent Test**: Access profile page → fill name/email → click Save → verify success message

### Phase 3 Tasks

- [X] T009 **[P] [US1] [Component]** Create `phase-2/frontend/src/components/profile/ProfileInfoCard.tsx`:
  - Import: `Card`, `motion`, `fadeInUp`, `useAuth`, `api`
  - Structure: Form with name/email inputs, Save button
  - State: Form validation, loading states, error handling
  - Design: Follow Technical Editorial patterns (mono labels, serif headings)

- [X] T010 **[P] [US1] [Integration]** Add `updateProfile` method to `useAuth` hook in `phase-2/frontend/src/hooks/useAuth.ts`:
  - Returns: `{ success: boolean; error?: string }`
  - Calls: `api.updateProfile()` then `refetch()`

- [X] T011 **[US1] [Form Logic]** Implement form validation in ProfileInfoCard:
  - Enable Save button only when inputs valid and different from current
  - Show inline errors for invalid email format
  - Handle loading state during API call

- [X] T012 **[US1] [Feedback]** Add success/error feedback in ProfileInfoCard:
  - Success: Green message, clear form state
  - Error: Red inline message, allow retry
  - Use existing Card component for consistent styling

- [X] T013 **[US1] [Animation]** Apply motion to ProfileInfoCard:
  - Use `fadeInUp` for card entrance
  - Use `hoverScale` for Save button
  - Follow animation rules from T002

---

## Phase 4: User Story 2 - Change Password (P2)

*Goal: Enable secure password changes with validation*

**Independent Test**: Enter current + new + confirm → click Update → verify fields clear

### Phase 4 Tasks

- [X] T014 **[P] [US2] [Component]** Create `phase-2/frontend/src/components/profile/PasswordChangeCard.tsx`:
  - Import: `Card`, `motion`, `useAuth`, `api`
  - Structure: 3 password inputs (masked), Update button
  - State: Match validation, loading, error handling
  - Design: Technical form patterns with mono labels

- [X] T015 **[P] [US2] [Integration]** Add `changePassword` method to `useAuth` hook:
  - Returns: `{ success: boolean; error?: string }`
  - Calls: `api.changePassword()`

- [X] T016 **[US2] [Validation]** Implement password match logic in PasswordChangeCard:
  - Real-time validation: new === confirm
  - Enable Update only when all fields valid and new ≠ current
  - Show inline error for mismatched passwords

- [X] T017 **[US2] [Feedback]** Add success/error handling in PasswordChangeCard:
  - Success: Clear all 3 fields, show success message
  - Error: Show specific error message, keep fields populated
  - Prevent duplicate submissions

- [X] T018 **[US2] [Animation]** Apply motion to PasswordChangeCard:
  - Use `fadeInUp` for card entrance
  - Use `hoverScale` for Update button
  - Add subtle shake animation for validation errors

---

## Phase 5: User Story 3 - View Account Information (P3)

*Goal: Display read-only account details with icons*

**Independent Test**: Load profile page → verify name, email, member date display correctly

### Phase 5 Tasks

- [X] T019 **[P] [US3] [Component]** Create `phase-2/frontend/src/components/profile/AccountInfoCard.tsx`:
  - Import: `Card`, `motion`, `useAuth`, `User`, `Mail`, `Calendar` icons
  - Structure: 3 rows with icons + text
  - Data: From `useAuth().user`
  - Design: Icon alignment, typography hierarchy

- [X] T020 **[US3] [Data Formatting]** Implement date formatting in AccountInfoCard:
  - Use existing `formatDate()` utility from `phase-2/frontend/src/lib/utils.ts`
  - Format: "Month DD, YYYY" (e.g., "December 30, 2025")
  - Handle missing date: Show placeholder or hide row

- [X] T021 **[US3] [Real-time Updates]** Ensure AccountInfoCard updates when profile changes:
  - Use `useEffect` to watch `useAuth().user`
  - Re-render when user data changes
  - Verify updates after ProfileInfoCard save

- [X] T022 **[US3] [Animation]** Apply motion to AccountInfoCard:
  - Use `fadeInUp` for card entrance
  - Use `staggerContainer` for the 3 info rows
  - Use `scaleIn` for icon appearances

---

## Phase 6: User Story 4 - View Task Statistics (P3)

*Goal: Display real-time task counts*

**Independent Test**: Verify counts match actual task data, update when tasks change

### Phase 6 Tasks

- [X] T023 **[P] [US4] [Component]** Create `phase-2/frontend/src/components/profile/TaskStatsCard.tsx`:
  - Import: `Card`, `motion`, `useTasks`
  - Structure: 3 stat boxes (Total, Pending, Completed)
  - Data: Calculate from `useTasks().tasks`
  - Design: Technical layout with mono labels

- [X] T024 **[US4] [Stats Calculation]** Implement real-time calculation logic:
  - `total = tasks.length`
  - `pending = tasks.filter(t => !t.completed).length`
  - `completed = tasks.filter(t => t.completed).length`
  - Handle empty state: Show "0" not empty

- [X] T025 **[US4] [Real-time Updates]** Ensure stats update when tasks change:
  - Use `useEffect` to watch `useTasks().tasks`
  - Recalculate on every task change
  - Test: Create task → verify total increments

- [X] T026 **[US4] [Animation]** Apply motion to TaskStatsCard:
  - Use `fadeInUp` for card entrance
  - Use `staggerContainer` for the 3 stat boxes
  - Use `scaleIn` for number animations

---

## Phase 7: User Story 5 - Sign Out (P2)

*Goal: Secure logout with redirect*

**Independent Test**: Click sign out → verify redirect to /login → session cleared

### Phase 7 Tasks

- [X] T027 **[P] [US5] [Component]** Create `phase-2/frontend/src/components/profile/DangerZoneCard.tsx`:
  - Import: `Card`, `motion`, `useAuth`, `useRouter`
  - Structure: Danger-styled Sign Out button
  - Design: Distinct visual treatment (orange/red accent)

- [X] T028 **[US5] [Integration]** Implement sign out flow in DangerZoneCard:
  - Call `useAuth().signOut()`
  - Use `useRouter().push('/login')` for redirect
  - Clear any local state if needed

- [X] T029 **[US5] [Security]** Verify session clearance:
  - Check that useAuth state resets to null
  - Verify redirect prevents access to dashboard
  - Test: Sign out → try to navigate back → should redirect

- [X] T030 **[US5] [Animation]** Apply motion to DangerZoneCard:
  - Use `fadeInUp` for card entrance
  - Use `hoverScale` with subtle scale-down for sign out button
  - Add subtle pulse animation to draw attention

---

## Phase 8: Main Profile Page Integration

*Goal: Assemble all components into responsive layout*

### Phase 8 Tasks

- [X] T031 **[P] [Layout]** Update `phase-2/frontend/src/app/(dashboard)/profile/page.tsx`:
  - Import all 5 new components
  - Implement responsive grid: 2 columns desktop (≥768px), 1 column mobile
  - Desktop order: Left column (ProfileInfoCard, PasswordChangeCard), Right column (AccountInfoCard, TaskStatsCard, DangerZoneCard)
  - Mobile order: ProfileInfoCard → AccountInfoCard → TaskStatsCard → PasswordChangeCard → DangerZoneCard

- [X] T032 **[P] [Responsive Design]** Add Tailwind breakpoints:
  - Container: `max-w-6xl mx-auto px-4`
  - Grid: `grid grid-cols-1 md:grid-cols-2 gap-6`
  - Mobile ordering: Use `md:order-*` utilities where needed

- [X] T033 **[Page Animation]** Apply page-level motion:
  - Use `fadeInUp` for main container
  - Use `staggerContainer` for component cascade
  - Ensure smooth loading experience

---

## Phase 9: Polish & Cross-Cutting Concerns

*Goal: Finalize user experience and handle edge cases*

### Phase 9 Tasks

- [X] T034 **[Edge Cases]** Handle network failures across all API calls:
  - Add retry logic or user-friendly error messages
  - Test: Disconnect network → attempt save → verify graceful error

- [X] T035 **[Edge Cases]** Handle session expiration during edits:
  - Detect 401 responses → redirect to login with return URL
  - Test: Sign out in another tab → attempt save → verify redirect

- [X] T036 **[Edge Cases]** Handle empty task states:
  - Verify TaskStatsCard shows "0" when no tasks exist
  - Test: Delete all tasks → verify stats display correctly

- [X] T037 **[Accessibility]** Verify keyboard navigation:
  - Tab through all form fields
  - Enter submits forms
  - Escape cancels if applicable
  - Screen reader labels for all inputs

- [X] T038 **[Accessibility]** Verify ARIA labels:
  - Add labels to all form inputs
  - Add descriptions to icon displays
  - Ensure error messages are announced

- [X] T039 **[Performance]** Verify real-time update performance:
  - Test: Create 100 tasks → verify stats update within 2 seconds
  - Test: Rapid task changes → verify no UI lag

- [X] T040 **[Final Review]** Cross-browser testing:
  - Test in Chrome, Firefox, Safari
  - Verify responsive breakpoints work
  - Check animations perform smoothly

---

## Parallel Execution Examples

**After Phase 2 completes, these can run in parallel:**

**Team Member A (US1 + US2)**:
- T009 → T010 → T011 → T012 → T013 (US1)
- T014 → T015 → T016 → T017 → T018 (US2)

**Team Member B (US3 + US4)**:
- T019 → T020 → T021 → T022 (US3)
- T023 → T024 → T025 → T026 (US4)

**Team Member C (US5 + Layout)**:
- T027 → T028 → T029 → T030 (US5)
- T031 → T032 → T033 (Page Integration)

**Polish Phase (All members)**:
- T034 → T035 → T036 → T037 → T038 → T039 → T040

---

## Task Count Summary

- **Total Tasks**: 40
- **Setup & Skills**: 5 tasks (T001-T005)
- **Foundational**: 3 tasks (T006-T008)
- **US1 (Edit Profile)**: 5 tasks (T009-T013)
- **US2 (Change Password)**: 5 tasks (T014-T018)
- **US3 (Account Info)**: 4 tasks (T019-T022)
- **US4 (Task Stats)**: 4 tasks (T023-T026)
- **US5 (Sign Out)**: 4 tasks (T027-T030)
- **Page Integration**: 3 tasks (T031-T033)
- **Polish**: 7 tasks (T034-T040)

**MVP Scope**: T001-T013 (Setup + US1) = 13 tasks for core profile editing functionality

**Independent Test Criteria per Story**:
- **US1**: Fill form → Save → Success message
- **US2**: Enter passwords → Update → Fields clear
- **US3**: Load page → Verify displayed data
- **US4**: Check counts → Create task → Verify increment
- **US5**: Click sign out → Redirect to login

---
**Status**: ✅ COMPLETE - All 40 tasks finished
**Completed**: 2025-12-30