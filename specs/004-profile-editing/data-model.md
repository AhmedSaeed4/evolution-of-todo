# Data Model: Profile Page Enhancement

**Date**: 2025-12-30
**Feature**: Profile Page Enhancement (004-profile-editing)

## Entity Definitions

### 1. User Profile (Extended)

**Source**: `useAuth` hook (existing)
**Type**: `User`

```typescript
interface User {
  id: string;           // UUID - unique identifier
  email: string;        // Validated email format
  name: string;         // Display name
  createdAt?: string;   // ISO 8601 timestamp (member since)
}
```

**Profile Update Request**:
```typescript
interface ProfileUpdateRequest {
  name: string;         // Required, non-empty
  email: string;        // Required, valid email format
}
```

**Password Change Request**:
```typescript
interface PasswordChangeRequest {
  currentPassword: string;  // Required, min 8 chars
  newPassword: string;      // Required, min 8 chars
  confirmPassword: string;  // Must match newPassword
}
```

### 2. Task Statistics (Derived)

**Source**: `useTasks` hook (existing)
**Type**: `TaskStats`

```typescript
interface TaskStats {
  total: number;        // Count of all tasks for user
  pending: number;      // Count of tasks with status 'pending'
  completed: number;    // Count of tasks with status 'completed'
}
```

**Calculation Logic**:
- `total` = `tasks.length`
- `pending` = `tasks.filter(t => t.status === 'pending').length`
- `completed` = `tasks.filter(t => t.status === 'completed').length`

## Validation Rules

### Profile Information Form
- **Name**: Required, 1-100 characters, no leading/trailing whitespace
- **Email**: Required, valid email format (RFC 5322), unique per user
- **Submit**: Enabled only when both fields valid and different from current values

### Password Change Form
- **Current Password**: Required, min 8 chars
- **New Password**: Required, min 8 chars, different from current
- **Confirm Password**: Required, must equal new password
- **Submit**: Enabled only when all fields valid and new ≠ current

### Account Information Display
- **Name**: Display as-is from user object
- **Email**: Display as-is from user object
- **Member Since**: Format as "Month DD, YYYY" (e.g., "December 30, 2025")

### Task Statistics Display
- **All counts**: Display as integers (0+)
- **Empty state**: Show "0" when no tasks exist
- **Real-time**: Update immediately when tasks change

## State Transitions

### Profile Update Flow
```
User enters data → Validate → API call → Success → Update useAuth → UI feedback
                    ↓
              Error → Show inline error → Allow retry
```

### Password Change Flow
```
User enters data → Validate match → API call → Success → Clear fields → UI feedback
                    ↓
              Error → Show inline error → Allow retry
```

### Sign Out Flow
```
User clicks sign out → Call useAuth.signOut() → Clear session → Redirect to /login
```

## Data Flow

### Real-time Updates
```
useTasks hook updates → TaskStatsCard re-renders → Statistics display updates
```

### User Data Updates
```
ProfileInfoCard saves → api.updateProfile() → useAuth.refetch() → All components update
```

## Dependencies

### Existing Entities (No Changes)
- **Task**: From `useTasks` - used for statistics calculation
- **User**: From `useAuth` - used for profile data

### New API Methods (3 required)
1. `updateProfile(data: ProfileUpdateRequest): Promise<User>`
2. `changePassword(data: PasswordChangeRequest): Promise<void>`
3. `getTaskStats(): Promise<TaskStats>`

## Constraints

- **No database schema changes** - all data from existing hooks
- **No backend modifications** - mock API extension only
- **Client-side only** - state management via React hooks
- **Real-time** - updates via existing hook subscriptions

---
**Status**: ✅ Complete - Ready for API contract generation