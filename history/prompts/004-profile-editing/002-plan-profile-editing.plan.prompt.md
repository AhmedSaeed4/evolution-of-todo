---
id: 002
title: plan profile editing
stage: plan
date: 2025-12-30
surface: agent
model: claude-opus-4-5-20251101
feature: 004-profile-editing
branch: 004-profile-editing
user: user
command: /sp.plan # Profile Page Enhancement Specification

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
labels: [plan, profile-enhancement, feature-004]
links:
  spec: specs/004-profile-editing/spec.md
  plan: specs/004-profile-editing/plan.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-profile-editing/plan.md (created)
  - specs/004-profile-editing/research.md (created)
  - specs/004-profile-editing/data-model.md (created)
  - specs/004-profile-editing/quickstart.md (created)
  - specs/004-profile-editing/contracts/api-contracts.md (created)
  - CLAUDE.md (updated with new technologies)
tests:
  - Constitution Check: ALL GATES PASSED ✅
  - 8/8 compliance items verified
  - No violations or complexity tracking needed
  - Phase 0: Research completed (no unknowns)
  - Phase 1: Design artifacts generated
  - Ready for Phase 2: Task creation
---

## Prompt

# Profile Page Enhancement Specification

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

✅ **Planning Phase Complete**

**Branch**: `004-profile-editing`
**Spec**: `specs/004-profile-editing/spec.md`
**Plan**: `specs/004-profile-editing/plan.md`

**Generated Artifacts:**
1. ✅ `plan.md` - Implementation plan with constitution compliance
2. ✅ `research.md` - Phase 0 research (no unknowns)
3. ✅ `data-model.md` - Entity definitions and validation rules
4. ✅ `quickstart.md` - Step-by-step implementation guide
5. ✅ `contracts/api-contracts.md` - TypeScript interface definitions

**Constitution Check**: ✅ ALL GATES PASSED
- 8/8 compliance items verified
- No violations requiring complexity tracking
- Ready for implementation

**Next Steps:**
- Run `/sp.tasks` to generate detailed implementation tasks
- Follow `quickstart.md` for implementation
- All design decisions documented and validated

## Outcome

- ✅ Impact: Complete architectural plan with all Phase 0 and Phase 1 artifacts
- 🧪 Tests: Constitution compliance verified, all gates passed
- 📁 Files: 5 new artifacts created, agent context updated
- 🔁 Next prompts: /sp.tasks (for implementation tasks)
- 🧠 Reflection: Feature is well-scoped, no architectural blockers, ready for coding

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - Constitution 100% compliant
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Generate tasks.md with /sp.tasks