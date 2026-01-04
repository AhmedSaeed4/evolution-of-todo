# Quickstart Guide: Frontend UX Polish & Enhancements

**Feature**: 007-frontend-ux-polish
**Date**: 2025-12-31
**Estimated Setup Time**: 5 minutes
**Estimated Implementation Time**: 2-3 hours

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Existing Next.js 16+ frontend setup
- ✅ TypeScript configured
- ✅ Framer Motion installed (already present)
- ✅ Lucide React installed (already present)
- ✅ Access to `phase-2/frontend` directory

---

## Installation

### Step 1: Install Sonner

```bash
cd phase-2/frontend
npm install sonner
```

**Expected outcome**: Package added to `package.json` dependencies

---

### Step 2: Verify Installation

```bash
npm list sonner
```

**Expected output**:
```
frontend@0.1.0
└── sonner@2.0.0
```

---

## Configuration

### Step 3: Add Toaster to Root Layout

**File**: `phase-2/frontend/src/app/layout.tsx`

**Add imports**:
```tsx
import { Toaster } from 'sonner';
```

**Add Toaster component** (after `{children}`):
```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            duration={4000}
            richColors={true}
            closeButton={true}
            toastOptions={{
              className: 'font-mono text-sm',
              style: {
                background: '#F9F7F2',
                color: '#2A1B12',
                border: '1px solid #E5E0D6',
                borderRadius: '0px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Design alignment**:
- ✅ Position: Bottom-right (FR-004)
- ✅ Duration: 4 seconds (FR-005)
- ✅ Colors: Modern Technical Editorial palette
- ✅ Typography: Mono font for technical feel
- ✅ Sharp corners: No border radius (DR-006)

---

## Implementation

### Step 4: Add Toasts to useTasks Hook

**File**: `phase-2/frontend/src/hooks/useTasks.ts`

**Add import**:
```tsx
import { toast } from 'sonner';
```

**Update createTask function** (after line 63):
```tsx
const createTask = async (data: CreateTaskDTO): Promise<{ success: boolean; task?: Task; error?: string }> => {
  if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

  try {
    const newTask = await api.create(effectiveUserId, data);
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    toast.success("Task created"); // ← ADD THIS
    return { success: true, task: newTask };
  } catch (error) {
    toast.error((error as Error).message); // ← ADD THIS
    return { success: false, error: (error as Error).message };
  }
};
```

**Update updateTask function** (after line 79):
```tsx
const updateTask = async (taskId: string, data: UpdateTaskDTO): Promise<{ success: boolean; task?: Task; error?: string }> => {
  if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

  try {
    const updatedTask = await api.update(effectiveUserId, taskId, data);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
    }));
    toast.success("Task updated"); // ← ADD THIS
    return { success: true, task: updatedTask };
  } catch (error) {
    toast.error((error as Error).message); // ← ADD THIS
    return { success: false, error: (error as Error).message };
  }
};
```

**Update deleteTask function** (after line 93):
```tsx
const deleteTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
  if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

  try {
    await api.delete(effectiveUserId, taskId);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
    toast.success("Task deleted"); // ← ADD THIS
    return { success: true };
  } catch (error) {
    toast.error((error as Error).message); // ← ADD THIS
    return { success: false, error: (error as Error).message };
  }
};
```

**Update toggleTask function** (after line 108):
```tsx
const toggleTask = async (taskId: string): Promise<{ success: boolean; task?: Task; error?: string }> => {
  if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

  try {
    const updatedTask = await api.toggleComplete(effectiveUserId, taskId);
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
    }));
    // ← ADD THESE LINES
    if (updatedTask.completed) {
      toast.success("Task completed");
    } else {
      toast.success("Task reopened");
    }
    return { success: true, task: updatedTask };
  } catch (error) {
    toast.error((error as Error).message); // ← ADD THIS
    return { success: false, error: (error as Error).message };
  }
};
```

---

### Step 5: Add Toasts to AuthContext

**File**: `phase-2/frontend/src/contexts/AuthContext.tsx`

**Add import**:
```tsx
import { toast } from 'sonner';
```

**Update signIn function** (after line 116):
```tsx
const signIn = useCallback(async (email: string, password: string) => {
  // If bypass is enabled, auto-authenticate with mock user
  if (isAuthBypassEnabled()) {
    await checkAuth();
    toast.success("Welcome back!"); // ← ADD THIS
    return { success: true };
  }

  try {
    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Call checkAuth to update state
    await checkAuth();
    toast.success("Welcome back!"); // ← ADD THIS

    return { success: true };
  } catch (error) {
    toast.error((error as Error).message); // ← ADD THIS
    return { success: false, error: (error as Error).message };
  }
}, [checkAuth]);
```

**Update signOut function** (after line 157):
```tsx
const signOut = useCallback(async () => {
  // If bypass is enabled, just reset state (no actual logout)
  if (isAuthBypassEnabled()) {
    setState({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
    toast.info("Logged out"); // ← ADD THIS
    return { success: true };
  }

  try {
    await authClient.signOut();
    setState({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,
    });
    toast.info("Logged out"); // ← ADD THIS
    return { success: true };
  } catch (error) {
    toast.error((error as Error).message); // ← ADD THIS
    return { success: false, error: (error as Error).message };
  }
}, []);
```

**Update changePassword function** (after line 239):
```tsx
const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }) => {
  if (!state.user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Check for session expiration before making request
  if (!isAuthBypassEnabled() && !state.isAuthenticated) {
    return { success: false, error: 'Session expired. Please sign in again.' };
  }

  try {
    // Use Better Auth's changePassword method
    const result = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Failed to change password');
    }

    toast.success("Password changed successfully"); // ← ADD THIS
    return { success: true };
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Handle specific error cases
    if (errorMessage.includes('Session expired') || errorMessage.includes('User not found') || errorMessage.includes('Unauthorized')) {
      // Force sign out on session issues
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      toast.error("Session expired. Please sign in again."); // ← ADD THIS
      return { success: false, error: 'Session expired. Please sign in again.' };
    }

    // Handle incorrect current password
    if (errorMessage.includes('incorrect') || errorMessage.includes('Invalid')) {
      toast.error("Current password is incorrect"); // ← ADD THIS
      return { success: false, error: 'Current password is incorrect' };
    }

    toast.error(errorMessage); // ← ADD THIS
    return { success: false, error: errorMessage };
  }
}, [state.user, state.isAuthenticated]);
```

---

### Step 6: Update TaskCard Date Display

**File**: `phase-2/frontend/src/components/tasks/TaskCard.tsx`

**Add import**:
```tsx
import { Calendar, Clock, Pencil } from 'lucide-react';
```

**Replace date display section** (lines 72-84):
```tsx
<div className="flex items-center gap-3 text-[10px] font-mono opacity-60">
  {task.dueDate && (
    <div className="flex items-center gap-1.5">
      <Calendar className="w-3 h-3" strokeWidth={1.5} />
      <span className="uppercase tracking-widest">Due: {formatDate(task.dueDate)}</span>
    </div>
  )}
  <div className="flex items-center gap-1.5">
    <Clock className="w-3 h-3" strokeWidth={1.5} />
    <span className="uppercase tracking-widest">Created: {formatDate(task.createdAt)}</span>
  </div>
  {task.updatedAt !== task.createdAt && (
    <div className="flex items-center gap-1.5 text-accent">
      <Pencil className="w-3 h-3" strokeWidth={1.5} />
      <span className="uppercase tracking-widest">Updated: {formatDate(task.updatedAt)}</span>
    </div>
  )}
</div>
```

**Design alignment**:
- ✅ Labels: "Due:", "Created:", "Updated:" (FR-001)
- ✅ Icons: Lucide with strokeWidth={1.5} (DR-005)
- ✅ Typography: `font-mono text-[10px] uppercase tracking-widest` (DR-004)
- ✅ Conditional: Updated date only when different (FR-002)
- ✅ Color: Accent for updated date (Modern Technical Editorial)

---

### Step 7: Add Task Completion Animation

**File**: `phase-2/frontend/src/components/tasks/TaskCard.tsx`

**Import motion** (already imported, verify):
```tsx
import { motion } from 'framer-motion';
```

**Wrap the main container** (replace line 33):
```tsx
// Replace this:
return (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    custom={index}
    className={cn(
      'bg-background border border-structure/10 p-4 rounded-sm',
      'hover:shadow-md transition-shadow duration-300',
      priorityColors[task.priority],
      task.completed && 'opacity-60'
    )}
  >
    {/* content */}
  </motion.div>
);

// With this:
return (
  <motion.div
    variants={fadeInUp}
    initial="hidden"
    animate="visible"
    custom={index}
    className={cn(
      'bg-background border border-structure/10 p-4 rounded-sm',
      'hover:shadow-md transition-shadow duration-300',
      priorityColors[task.priority]
    )}
  >
    <motion.div
      animate={{
        scale: task.completed ? 0.98 : 1,
        opacity: task.completed ? 0.6 : 1
      }}
      transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="transition-all"
    >
      <div className="flex items-start gap-3">
        {/* existing content */}
      </div>
    </motion.div>
  </motion.div>
);
```

**Update strikethrough** (line 56):
```tsx
// Remove: task.completed && 'opacity-60'
// Keep: line-through decoration-structure/50
```

**Design alignment**:
- ✅ Scale effect: 0.98 when completed (FR-007)
- ✅ Opacity: 0.6 when completed (FR-008)
- ✅ Smooth transition: 0.2s with editorial ease
- ✅ No layout thrashing: Only transform/opacity animated

---

## Verification

### Step 8: Start Development Server

```bash
cd phase-2/frontend
npm run dev
```

### Step 9: Manual Testing Checklist

#### Toast Notifications
- [ ] Login → "Welcome back!" toast appears bottom-right
- [ ] Create task → "Task created" toast appears
- [ ] Edit task → "Task updated" toast appears
- [ ] Delete task → "Task deleted" toast appears
- [ ] Toggle task → "Task completed" or "Task reopened" toast appears
- [ ] Logout → "Logged out" toast appears
- [ ] Change password → "Password changed successfully" toast appears
- [ ] API error → Error message appears in toast

#### Date Labels
- [ ] View task with due date → "Due: [date]" with calendar icon
- [ ] View any task → "Created: [date]" with clock icon
- [ ] Edit existing task → "Updated: [date]" with pencil icon appears
- [ ] Create new task → No "Updated:" label (same timestamps)

#### Animations
- [ ] Click checkbox → Subtle scale animation (0.98)
- [ ] Complete task → Smooth opacity fade to 0.6
- [ ] Reopen task → Smooth return to full opacity/scale
- [ ] Performance → No jank, smooth 60fps

#### Visual Design
- [ ] Toasts use cream background (#F9F7F2)
- [ ] Toasts have sharp corners (no border radius)
- [ ] Date labels use mono font with wide tracking
- [ ] Icons use strokeWidth={1.5}
- [ ] Updated date uses accent color (#FF6B4A)

---

## Troubleshooting

### Issue: Toast not appearing
**Solution**: Check that Toaster is in RootLayout and app is wrapped in AuthProvider

### Issue: TypeScript errors
**Solution**: Verify imports and check that sonner types are recognized

### Issue: Animation not working
**Solution**: Ensure framer-motion is installed and motion.div is properly wrapped

### Issue: Date formatting wrong
**Solution**: Check that formatDate function handles null/undefined correctly

### Issue: Performance issues
**Solution**: Use Chrome DevTools Performance tab to profile animations

---

## Success Criteria

All requirements met when:
- ✅ All 6 toast types appear correctly
- ✅ Date labels display with proper formatting
- ✅ Animations run at 60fps
- ✅ No TypeScript errors
- ✅ No breaking changes to existing functionality
- ✅ Modern Technical Editorial aesthetic maintained

---

## Next Steps

1. **Run full manual test** of all user stories
2. **Performance validation** with Chrome DevTools
3. **Code review** for TypeScript compliance
4. **Merge to branch** `007-frontend-ux-polish`
5. **Create PR** for review

**Estimated completion**: 2-3 hours from start to verified completion