# API Contracts: Profile Enhancement

**Date**: 2025-12-30
**Feature**: Profile Page Enhancement (004-profile-editing)
**Type**: TypeScript Interface Definitions

## Overview

This document defines the TypeScript interfaces for the 3 new API methods required for profile enhancement. These methods extend the existing `api` object in `phase-2/frontend/src/lib/api.ts`.

## API Methods

### 1. Update Profile

**Purpose**: Update user's name and email address

**Method Signature**:
```typescript
updateProfile(data: ProfileUpdateRequest): Promise<User>
```

**Request Interface**:
```typescript
interface ProfileUpdateRequest {
  name: string;    // Required, 1-100 chars
  email: string;   // Required, valid email format
}
```

**Response Interface**:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}
```

**Error Cases**:
- `400`: Invalid input (validation failed)
- `409`: Email already exists (conflict)
- `401`: Not authenticated
- `500`: Internal server error

**Example Usage**:
```typescript
const result = await api.updateProfile({
  name: "John Doe",
  email: "john@example.com"
});

if (result.success) {
  // Update local state via useAuth.refetch()
} else {
  // Show error message
}
```

### 2. Change Password

**Purpose**: Change user's password with validation

**Method Signature**:
```typescript
changePassword(data: PasswordChangeRequest): Promise<void>
```

**Request Interface**:
```typescript
interface PasswordChangeRequest {
  currentPassword: string;  // Required, min 8 chars
  newPassword: string;      // Required, min 8 chars
  confirmPassword: string;  // Must equal newPassword
}
```

**Response**: `Promise<void>` - resolves on success, rejects on error

**Error Cases**:
- `400`: Validation failed (passwords don't match, weak password)
- `401`: Current password incorrect
- `401`: Not authenticated
- `500`: Internal server error

**Example Usage**:
```typescript
try {
  await api.changePassword({
    currentPassword: "oldpass123",
    newPassword: "newpass456",
    confirmPassword: "newpass456"
  });
  // Clear form fields
  // Show success message
} catch (error) {
  // Show error message
}
```

### 3. Get Task Statistics

**Purpose**: Calculate and return task statistics for current user

**Method Signature**:
```typescript
getTaskStats(): Promise<TaskStats>
```

**Response Interface**:
```typescript
interface TaskStats {
  total: number;      // All tasks
  pending: number;    // Incomplete tasks
  completed: number;  // Completed tasks
}
```

**Error Cases**:
- `401`: Not authenticated
- `500`: Internal server error

**Example Usage**:
```typescript
const stats = await api.getTaskStats();
// Returns: { total: 15, pending: 8, completed: 7 }
```

## Implementation Notes

### Mock Implementation Strategy

Since this is a frontend-only enhancement using mock data:

```typescript
// In api.ts - extend existing mock implementation

export const api = {
  // ... existing methods

  // NEW: Update Profile
  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    // Validate input
    if (!data.name || !data.email) throw new Error('Name and email required');
    if (!isValidEmail(data.email)) throw new Error('Invalid email format');

    // Update mock user
    const userIndex = mockUsers.findIndex(u => u.id === 'bypass-user');
    if (userIndex === -1) throw new Error('User not found');

    // Check email conflict
    const emailExists = mockUsers.some(u => u.email === data.email && u.id !== 'bypass-user');
    if (emailExists) throw new Error('Email already exists');

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      name: data.name,
      email: data.email
    };

    return mockUsers[userIndex];
  },

  // NEW: Change Password
  async changePassword(data: PasswordChangeRequest): Promise<void> {
    // Validate
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      throw new Error('All fields required');
    }
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    if (data.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // In mock mode, we simulate success
    // In real implementation, would verify current password
    return Promise.resolve();
  },

  // NEW: Get Task Statistics
  async getTaskStats(): Promise<TaskStats> {
    const userTasks = mockTasks.filter(t => t.userId === 'bypass-user');

    return {
      total: userTasks.length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      completed: userTasks.filter(t => t.status === 'completed').length
    };
  }
};
```

### Integration with Hooks

**useAuth Enhancement** (if needed):
```typescript
// Add to useAuth return object
updateProfile: (data: ProfileUpdateRequest) => Promise<{ success: boolean; error?: string }>;
changePassword: (data: PasswordChangeRequest) => Promise<{ success: boolean; error?: string }>;
```

**useTasks Enhancement** (if needed):
```typescript
// Add to useTasks return object
getStats: () => TaskStats;  // Computed from current tasks
```

## Testing Contracts

### Unit Test Scenarios

1. **Profile Update**
   - ✅ Valid data → Success
   - ✅ Invalid email → Error
   - ✅ Duplicate email → Error
   - ✅ Empty name → Error

2. **Password Change**
   - ✅ Matching passwords → Success
   - ✅ Mismatched passwords → Error
   - ✅ Short password → Error
   - ✅ Missing fields → Error

3. **Task Stats**
   - ✅ No tasks → { total: 0, pending: 0, completed: 0 }
   - ✅ Mixed tasks → Correct counts
   - ✅ Real-time updates → Stats change immediately

---
**Status**: ✅ Complete - Ready for implementation