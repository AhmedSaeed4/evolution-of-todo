# Data Model: Frontend UX Polish & Enhancements

**Feature**: 007-frontend-ux-polish
**Date**: 2025-12-31
**Scope**: Frontend-only UI enhancements

---

## Overview

This feature is **UI/UX focused** and does not introduce new data entities or modify existing data structures. All changes are presentation-layer enhancements that work with existing Task and User types.

---

## Existing Entities (Unchanged)

### Task Entity
Defined in `phase-2/frontend/src/types/index.ts`

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
```

**Relevant for this feature**:
- `dueDate`: Used for "Due:" label display
- `createdAt`: Used for "Created:" label display
- `updatedAt`: Used for conditional "Updated:" label display
- `completed`: Used for animation state transitions

### User Entity
Defined in `phase-2/frontend/src/types/index.ts`

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
```

**Relevant for this feature**: No changes required.

---

## UI State (Ephemeral)

### Toast Notification State
**Type**: Ephemeral UI state (not persisted)
**Scope**: Global, managed by Sonner library
**Lifetime**: 4 seconds (configurable)

**States**:
```typescript
type ToastType = 'success' | 'error' | 'info';
type ToastPosition = 'bottom-right' | 'top-center' | etc.;
```

**Triggers**:
- Task CRUD operations (create, update, delete, toggle)
- Auth events (login, logout, password change)
- Error conditions (API failures)

### Animation State
**Type**: Component-level animation state
**Scope**: Individual TaskCard components
**Lifetime**: Duration of animation (0.2-0.4s)

**States**:
```typescript
interface AnimationState {
  isAnimating: boolean;
  targetScale: number; // 0.98 (completed) or 1 (pending)
  targetOpacity: number; // 0.6 (completed) or 1 (pending)
}
```

**Triggers**:
- Checkbox click (task completion toggle)
- State transitions (pending ↔ completed)

---

## Data Flow

### Toast Integration Points

#### useTasks Hook
```typescript
// Current state transitions remain unchanged
// Added: Toast feedback on success/error

createTask(data) → API call → State update → toast.success("Task created")
updateTask(id, data) → API call → State update → toast.success("Task updated")
deleteTask(id) → API call → State update → toast.success("Task deleted")
toggleTask(id) → API call → State update → toast.success("Task completed"/"Task reopened")
```

#### AuthContext
```typescript
// Current auth flow remains unchanged
// Added: Toast feedback on auth events

signIn(email, password) → Auth call → State update → toast.success("Welcome back!")
signOut() → Auth call → State update → toast.info("Logged out")
changePassword(data) → Auth call → State update → toast.success("Password changed")
```

### Date Display Logic

#### TaskCard Component
```typescript
// Enhanced date display logic (no data transformation)

const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Display logic:
// 1. If task.dueDate exists → Show "Due: [date]" with Calendar icon
// 2. Always show → "Created: [date]" with Clock icon
// 3. If task.updatedAt !== task.createdAt → Show "Updated: [date]" with Pencil icon
```

### Animation Logic

#### TaskCard Component
```typescript
// Motion wrapper for completion state

<motion.div
  animate={{
    scale: task.completed ? 0.98 : 1,
    opacity: task.completed ? 0.6 : 1
  }}
  transition={{
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1] // Editorial ease
  }}
>
  {/* Task content */}
</motion.div>
```

---

## Validation Rules

### Toast Messages
- **Success**: Clear, concise action confirmation
- **Error**: Pass through API error message
- **Info**: Neutral status updates

### Date Formatting
- **Format**: "Mon DD" (e.g., "Jan 15")
- **Labels**: Uppercase with colon ("Due:", "Created:", "Updated:")
- **Icons**: Lucide React with strokeWidth={1.5}

### Animation Performance
- **Target**: 60fps
- **Duration**: 0.2-0.4s
- **Easing**: Editorial curve `[0.22, 1, 0.36, 1]`
- **Properties**: Only transform/opacity (no layout thrashing)

---

## No Schema Changes Required

✅ **No database migrations needed**
✅ **No API contract changes**
✅ **No type definition modifications**
✅ **No validation rule updates**

This feature is purely presentational and operates on existing data structures.

---

## Integration Points Summary

| Component | Data In | Data Out | Changes |
|-----------|---------|----------|---------|
| **TaskCard.tsx** | Task entity | UI display only | Date labels, animation |
| **useTasks.ts** | Task DTOs | Task entities + toasts | Toast calls added |
| **AuthContext.tsx** | Auth credentials | User entity + toasts | Toast calls added |
| **layout.tsx** | N/A | Toaster component | Component added |

---

## Conclusion

**Data Impact**: Minimal - UI-only enhancements
**Schema Changes**: None
**API Changes**: None
**Risk**: Very Low

All changes are contained within the presentation layer and work with existing data structures.