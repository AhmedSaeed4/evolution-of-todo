# Feature Specification: Profile Page Enhancement

**Feature Branch**: `004-profile-editing`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "name the new branch "004-profile-editing" heres my specs # Profile Page Enhancement Specification

**Path:** `phase-2/frontend/src/app/(dashboard)/profile/page.tsx`

**Status:** Draft

## Missing Functionality

Based on the reference design, the profile page needs these 5 sections:

### 1. Profile Information Form

**Functionality:**
- Editable name and email input fields
- Pre-filled with current user data from `useAuth`
- **Save Changes** button that:
  - Validates inputs before submission
  - Calls `updateProfile()` API method
  - Shows success/error feedback

### 2. Change Password Form

**Functionality:**
- Three password input fields:
  - Current Password
  - New Password
  - Confirm New Password
- **Update Password** button that:
  - Validates new password matches confirmation
  - Calls `changePassword()` API method
  - Clears fields on success
  - Shows validation errors inline

### 3. Account Information Display

**Functionality:**
- Read-only display of:
  - User name (with User icon)
  - Email (with Mail icon)
  - Member since date (with Calendar icon, formatted date)
- Data sourced from `useAuth` hook

### 4. Task Statistics Dashboard

**Functionality:**
- Display three statistics:
  - **Total** - count of all tasks
  - **Pending** - count of incomplete tasks
  - **Completed** - count of completed tasks
- Data calculated from `useTasks` hook
- Updates in real-time when tasks change

### 5. Danger Zone

**Functionality:**
- **Sign Out** button that:
  - Calls `logout()` from `useAuth`
  - Redirects to `/login` page
  - Clears session data

## Layout

| Desktop (≥768px) | Mobile (<768px) |
|------------------|-----------------|
| Two columns | Single column stacked |
| Left: Forms (1, 2) | Order: 1 → 3 → 4 → 2 → 5 |
| Right: Info (3, 4, 5) | |

## New Components

| Component | Path |
|-----------|------|
| ProfileInfoCard | `components/profile/ProfileInfoCard.tsx` |
| PasswordChangeCard | `components/profile/PasswordChangeCard.tsx` |
| AccountInfoCard | `components/profile/AccountInfoCard.tsx` |
| TaskStatsCard | `components/profile/TaskStatsCard.tsx` |
| DangerZoneCard | `components/profile/DangerZoneCard.tsx` |

## API Methods Needed

```typescript
// Add to src/lib/api.ts
updateProfile(data: { name: string; email: string }): Promise<User>
changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>
getTaskStats(): Promise<{ total: number; pending: number; completed: number }>
```

## Acceptance Criteria

- [ ] User can edit and save profile name/email
- [ ] User can change password with validation
- [ ] Account info displays name, email, member date
- [ ] Task stats show accurate counts
- [ ] Sign out logs user out and redirects to login
- [ ] Layout is responsive (2 cols desktop, 1 col mobile)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Profile Information (Priority: P1)

As an authenticated user, I want to edit my profile information (name and email) so that I can keep my account details up to date.

**Why this priority**: This is the core functionality that users expect from a profile page - maintaining accurate personal information.

**Independent Test**: Can be fully tested by accessing the profile page, filling the name/email fields, and clicking "Save Changes" - delivers immediate user value.

**Acceptance Scenarios**:

1. **Given** user is on profile page, **When** they enter valid name and email, **Then** save button becomes active and clicking it shows success message
2. **Given** user enters invalid email format, **When** they click save, **Then** inline validation error appears and save is blocked
3. **Given** user has unsaved changes, **When** they navigate away, **Then** confirmation prompt appears

---

### User Story 2 - Change Password (Priority: P2)

As an authenticated user, I want to change my password to maintain account security.

**Why this priority**: Security feature that enables users to protect their accounts, secondary to profile updates.

**Independent Test**: Can be tested by entering current password, new password, and confirmation - validates security requirements independently.

**Acceptance Scenarios**:

1. **Given** user enters matching new passwords, **When** current password is correct, **Then** password updates successfully and fields clear
2. **Given** new password doesn't match confirmation, **When** user clicks update, **Then** inline error appears and API is not called
3. **Given** current password is incorrect, **When** user submits, **Then** error message appears without revealing whether current password exists

---

### User Story 3 - View Account Information (Priority: P3)

As an authenticated user, I want to see my account details and membership information.

**Why this priority**: Read-only information provides context and verification, supporting the editing features.

**Independent Test**: Can be tested by loading profile page and verifying displayed data matches user account - provides immediate value without editing.

**Acceptance Scenarios**:

1. **Given** user loads profile page, **When** data is available, **Then** name, email, and member since date display correctly
2. **Given** user account has no member date, **When** page loads, **Then** appropriate placeholder or hidden field appears
3. **Given** user updates profile, **When** save completes, **Then** displayed account info updates in real-time

---

### User Story 4 - View Task Statistics (Priority: P3)

As an authenticated user, I want to see my task completion statistics to understand my productivity.

**Why this priority**: Provides valuable insights and context about user activity, supporting engagement.

**Independent Test**: Can be tested by verifying counts match actual task data - provides immediate value for task management awareness.

**Acceptance Scenarios**:

1. **Given** user has 10 total tasks, **When** 3 are completed, **Then** stats show: Total 10, Pending 7, Completed 3
2. **Given** user creates new task, **When** task saves, **Then** total count increments immediately
3. **Given** user completes task, **When** task status changes, **Then** pending decreases and completed increases in real-time

---

### User Story 5 - Sign Out (Priority: P2)

As an authenticated user, I want to securely sign out of my account.

**Why this priority**: Essential security feature that protects user data on shared devices.

**Independent Test**: Can be tested by clicking sign out and verifying session termination and redirect - provides immediate security value.

**Acceptance Scenarios**:

1. **Given** user is signed in, **When** they click sign out, **Then** session clears and redirects to login page
2. **Given** user signs out, **When** they try to access dashboard, **Then** they are redirected to login
3. **Given** multiple browser tabs, **When** user signs out in one tab, **Then** other tabs detect logout and redirect

---

### Edge Cases

- **Network failures**: When API calls fail, show user-friendly error messages with retry options
- **Concurrent updates**: When multiple devices edit same profile, last write wins with conflict notification
- **Session expiration**: When session expires during edit, redirect to login with return URL
- **Password strength**: When new password doesn't meet requirements, show specific validation rules
- **Email conflicts**: When new email already exists in system, show appropriate error message
- **Empty states**: When user has no tasks, show "0" counts rather than empty placeholders
- **Loading states**: Show skeleton loaders or spinners during API calls to provide feedback
- **Accessibility**: All forms must support keyboard navigation and screen readers

## Requirements *(mandatory)*

**Constitution Alignment**: All requirements MUST comply with Evolution of Todo Constitution v1.1.0

### Functional Requirements

- **FR-001**: System MUST provide editable input fields for user name and email that pre-fill with current user data from authentication context
- **FR-002**: System MUST validate all profile inputs before submission and display inline validation errors for invalid data
- **FR-003**: System MUST provide password change functionality with three fields: current password, new password, and password confirmation
- **FR-004**: System MUST validate that new password and confirmation match before allowing submission
- **FR-005**: System MUST display read-only account information including user name, email, and formatted member since date
- **FR-006**: System MUST display task statistics showing total count, pending count, and completed count calculated from user's tasks
- **FR-007**: System MUST update task statistics in real-time when task data changes via the useTasks hook
- **FR-008**: System MUST provide sign-out functionality that clears session data and redirects to login page
- **FR-009**: System MUST show success/error feedback for all user actions (profile updates, password changes, sign out)
- **FR-010**: System MUST implement responsive layout with two columns on desktop (≥768px) and single column on mobile (<768px)
- **FR-011**: System MUST maintain mobile content order: Profile Form → Account Info → Task Stats → Password Form → Danger Zone
- **FR-012**: System MUST clear password fields after successful password change
- **FR-013**: System MUST prevent form submission during API calls to prevent duplicate requests

### Architecture Requirements

- **AR-001**: System MUST expose profile editing functionality through the existing application interface (Constitution II - user interaction)
- **AR-002**: System MUST maintain client-side state management using React hooks (useAuth, useTasks) (Constitution III - state management)
- **AR-003**: System MUST use event-driven patterns for real-time task statistic updates (Constitution IV - async operations)
- **AR-004**: System MUST enforce authentication requirements for all profile operations (Constitution V - security boundaries)
- **AR-005**: System MUST use only the specified technology stack: TypeScript, React, Next.js App Router (Constitution VI - authorized stack)

### Key Entities

- **User Profile**: Represents authenticated user account data including name, email, and member since date
- **Task Statistics**: Represents aggregated task data including total, pending, and completed counts
- **Password Change Request**: Represents the three-field password update operation with validation requirements

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete profile information updates in under 30 seconds from form fill to confirmation
- **SC-002**: 95% of users successfully save profile changes on first attempt without validation errors
- **SC-003**: Password change process completes successfully for 90% of users who attempt it
- **SC-004**: Task statistics display accurate counts that update within 2 seconds of task changes
- **SC-005**: Sign out process redirects users to login page within 1 second of button click
- **SC-006**: Mobile users can access all profile functionality without horizontal scrolling or content overflow
- **SC-007**: Zero data loss occurs during concurrent profile edits from multiple devices
- **SC-008**: All interactive elements meet WCAG 2.1 AA accessibility standards for keyboard navigation and screen readers
