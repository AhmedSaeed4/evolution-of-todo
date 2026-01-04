---
id: 001
title: specify profile editing
stage: spec
date: 2025-12-30
surface: agent
model: claude-opus-4-5-20251101
feature: 004-profile-editing
branch: 004-profile-editing
user: user
command: /sp.specify name the new branch "004-profile-editing" heres my specs # Profile Page Enhancement Specification

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
labels: [specification, profile-enhancement, feature-004]
links:
  spec: specs/004-profile-editing/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-profile-editing/spec.md (created)
  - specs/004-profile-editing/checklists/requirements.md (created)
tests:
  - Specification validation completed (all items pass)
  - No [NEEDS CLARIFICATION] markers found
  - All 5 user stories defined with acceptance scenarios
  - 8 edge cases identified
  - 13 functional requirements + 5 architecture requirements
  - 8 measurable success criteria
  - Requirements checklist marked complete (all items checked ✅)
  - Ready for planning phase
---

## Prompt

name the new branch "004-profile-editing" heres my specs # Profile Page Enhancement Specification

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

## Response snapshot

✅ **Feature branch created**: `004-profile-editing`
✅ **Specification generated**: `specs/004-profile-editing/spec.md`
✅ **Quality checklist created**: `specs/004-profile-editing/checklists/requirements.md`
✅ **All validation items pass**

**Key Deliverables:**
- 5 prioritized user stories (P1, P2, P2, P3, P3)
- 13 functional requirements + 5 architecture requirements
- 8 measurable success criteria
- 8 identified edge cases
- Complete acceptance scenarios for all user flows

**Ready for**: `/sp.clarify` or `/sp.plan`

## Outcome

- ✅ Impact: Complete specification with all mandatory sections, testable requirements, and measurable success criteria
- 🧪 Tests: Specification validation completed (all items pass), requirements checklist fully marked ✅
- 📁 Files: specs/004-profile-editing/spec.md, specs/004-profile-editing/checklists/requirements.md
- 🔁 Next prompts: /sp.clarify (if needed), /sp.plan (recommended)
- 🧠 Reflection: Specification is comprehensive and requirements phase is complete. Ready for planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - all validation items completed
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to planning phase with /sp.plan