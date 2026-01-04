# Feature Specification: Frontend UX Polish & Enhancements

**Feature Branch**: `007-frontend-ux-polish`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Feature Specification: Frontend UX Polish & Enhancements - This specification defines UX polish and enhancements for the Next.js frontend, including improved date display, toast notifications (Sonner), and micro-animations for task interactions. These changes enhance user feedback and visual polish without altering core functionality."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Clear Date Labels (Priority: P1)

As a user, I want to see labeled dates on my tasks so I can quickly understand what each date represents.

**Why this priority**: Improves usability - users currently see unlabeled dates which causes confusion.

**Independent Test**: User views a task and sees "Due: Jan 15", "Created: Dec 31", "Updated: Jan 1" with clear labels.

**Acceptance Scenarios**:

1. **Given** a task with a due date, **When** displayed, **Then** show "Due: [date]" with calendar icon
2. **Given** any task, **When** displayed, **Then** show "Created: [date]" with clock icon
3. **Given** a task that was updated, **When** createdAt ≠ updatedAt, **Then** show "Updated: [date]" with edit icon

---

### User Story 2 - Toast Notifications (Priority: P1)

As a user, I want to see confirmation messages when I perform actions so I know my action succeeded.

**Why this priority**: Critical UX feedback - users currently have no confirmation that actions completed.

**Independent Test**: User creates a task and sees a toast message "Task created successfully" in bottom-right corner.

**Acceptance Scenarios**:

1. **Given** user logs in, **When** login succeeds, **Then** show success toast "Welcome back!"
2. **Given** user creates task, **When** creation succeeds, **Then** show success toast "Task created"
3. **Given** user updates task, **When** update succeeds, **Then** show success toast "Task updated"
4. **Given** user deletes task, **When** deletion succeeds, **Then** show success toast "Task deleted"
5. **Given** user logs out, **When** logout completes, **Then** show info toast "Logged out"
6. **Given** user changes password, **When** change succeeds, **Then** show success toast "Password changed"
7. **Given** any action fails, **When** API error occurs, **Then** show error toast with message

---

### User Story 3 - Task Completion Animation (Priority: P2)

As a user, I want to see a satisfying animation when I complete a task so it feels rewarding.

**Why this priority**: Enhances engagement - micro-animations make the app feel polished and responsive.

**Independent Test**: User clicks checkbox on a task, sees a subtle scale-down and checkmark animation.

**Acceptance Scenarios**:

1. **Given** a pending task, **When** user clicks checkbox, **Then** task animates with scale effect
2. **Given** task becomes completed, **When** animation finishes, **Then** task shows strikethrough with fade
3. **Given** task is uncompleted, **When** user clicks checkbox, **Then** task animates back to normal state

---

### Edge Cases

- What happens when toast notifications overlap with each other?
- How does system handle toast queue when multiple actions occur rapidly?
- What happens when animation is interrupted by rapid state changes?
- How does system handle network failures during toast-triggered actions?

## Requirements *(mandatory)*

**Constitution Alignment**: All requirements MUST comply with Evolution of Todo Constitution v1.1.0

### Functional Requirements

- **FR-001**: TaskCard MUST display labeled dates (Due, Created, Updated) with distinct icons
- **FR-002**: Updated date MUST only show when different from created date
- **FR-003**: System MUST show toast notifications for all CRUD operations
- **FR-004**: Toast notifications MUST appear in bottom-right corner
- **FR-005**: Toast notifications MUST auto-dismiss after 4 seconds
- **FR-006**: Error toasts MUST display the error message from API
- **FR-007**: Task completion toggle MUST animate with scale effect
- **FR-008**: Completed tasks MUST animate to opacity-60 with strikethrough

### Design Requirements

- **DR-001**: MUST follow "Modern Technical Editorial" aesthetic
- **DR-002**: Colors MUST match: Background `#F9F7F2`, Text `#2A1B12`, Accent `#FF6B4A`
- **DR-003**: Typography Triad:
  - Headings: `Playfair Display` or `Young Serif`
  - Body: `DM Sans`
  - Tech/Labels: `JetBrains Mono`
- **DR-004**: Labels (Due/Created) MUST be `font-mono text-[10px] uppercase tracking-widest`
- **DR-005**: Icons MUST use `lucide-react` with `strokeWidth={1.5}` (Technical feel)
- **DR-006**: Toasts MUST use sharp corners and mono details

### Architecture Requirements

- **AR-001**: MUST use Sonner for toast notifications (lightweight, React-native)
- **AR-002**: MUST use existing Framer Motion for animations
- **AR-003**: MUST integrate toasts at layout level for global access
- **AR-004**: MUST NOT disrupt existing component structure

### Key Components to Modify

| Component | Changes |
|-----------|---------|
| `TaskCard.tsx` | Add date labels, completion animation |
| `layout.tsx` | Add Sonner Toaster provider |
| `useTasks.ts` | Add toast calls on success/error |
| `AuthContext.tsx` | Add toast calls on login/logout/password |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three dates visible with clear labels on task cards
- **SC-002**: Toast notifications appear for all 6 action types
- **SC-003**: Task toggle has visible animation (scale effect)
- **SC-004**: No performance degradation (no jank, smooth 60fps)
- **SC-005**: All existing functionality continues to work
