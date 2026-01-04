# Quickstart: Profile Page Enhancement

**Date**: 2025-12-30
**Feature**: Profile Page Enhancement (004-profile-editing)
**Branch**: `004-profile-editing`

## Prerequisites

- ✅ Phase-2 frontend environment already set up
- ✅ Existing authentication system (useAuth hook)
- ✅ Existing task management system (useTasks hook)
- ✅ Design system configured (Modern Technical Editorial)
- ✅ Framer Motion and Lucide React installed

## Quick Implementation Steps

### 1. Add API Methods (5 minutes)

**File**: `phase-2/frontend/src/lib/api.ts`

Add the 3 new methods to the existing `api` object:

```typescript
// Add these to the existing api object

async updateProfile(data: { name: string; email: string }): Promise<User> {
  // Implementation using mockUsers array
},

async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  // Validation and mock implementation
},

async getTaskStats(): Promise<{ total: number; pending: number; completed: number }> {
  // Calculate from mockTasks array
}
```

### 2. Create Profile Components (15 minutes)

**Directory**: `phase-2/frontend/src/components/profile/`

Create 5 new components:

```bash
# Run these commands or create files manually:
touch phase-2/frontend/src/components/profile/ProfileInfoCard.tsx
touch phase-2/frontend/src/components/profile/PasswordChangeCard.tsx
touch phase-2/frontend/src/components/profile/AccountInfoCard.tsx
touch phase-2/frontend/src/components/profile/TaskStatsCard.tsx
touch phase-2/frontend/src/components/profile/DangerZoneCard.tsx
```

### 3. Update Profile Page (5 minutes)

**File**: `phase-2/frontend/src/app/(dashboard)/profile/page.tsx`

Replace existing content with enhanced layout:

```tsx
// Import new components
import { ProfileInfoCard } from '@/components/profile/ProfileInfoCard';
import { PasswordChangeCard } from '@/components/profile/PasswordChangeCard';
import { AccountInfoCard } from '@/components/profile/AccountInfoCard';
import { TaskStatsCard } from '@/components/profile/TaskStatsCard';
import { DangerZoneCard } from '@/components/profile/DangerZoneCard';

// Use responsive grid layout
```

### 4. Test (5 minutes)

```bash
cd phase-2/frontend
npm run dev
# Navigate to /profile
# Test all 5 sections
```

## Component Design Patterns

### Follow Existing Patterns

**Use existing Card component**:
```tsx
import { Card } from '@/components/ui/Card';

<Card className="space-y-4">
  {/* Component content */}
</Card>
```

**Use existing motion variants**:
```tsx
import { motion } from 'framer-motion';
import { fadeInUp } from '@/motion/variants';

<motion.div variants={fadeInUp} initial="hidden" animate="visible">
  {/* Animated content */}
</motion.div>
```

**Use existing utility functions**:
```tsx
import { cn, formatDate, isValidEmail } from '@/lib/utils';

<div className={cn('base-class', className)}>
  {/* Content */}
</div>
```

### Design System Rules

**Colors** (from globals.css):
- Background: `bg-background` or `#F9F7F2`
- Text: `text-structure` or `#2A1B12`
- Accent: `text-accent` or `#FF6B4A`
- Borders: `border-wireframe/10` or `#E5E0D6/10`

**Typography**:
- Headings: `font-serif` (Playfair Display)
- Body: `font-sans` (DM Sans)
- Labels: `font-mono` (JetBrains Mono)

**Animation**:
- Hover: `transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}`
- Scale: `whileHover={{ scale: 1.02, y: -1 }}`
- No bounce, no rotation

## Component Responsibilities

### ProfileInfoCard
- **Input**: Name/email fields, save button
- **Output**: Calls api.updateProfile()
- **State**: Form validation, loading states
- **Feedback**: Success/error messages

### PasswordChangeCard
- **Input**: 3 password fields, update button
- **Output**: Calls api.changePassword()
- **State**: Password match validation, loading
- **Feedback**: Clear on success, errors inline

### AccountInfoCard
- **Input**: Uses useAuth() data
- **Output**: Read-only display
- **State**: None (pure display)
- **Icons**: User, Mail, Calendar from Lucide

### TaskStatsCard
- **Input**: Uses useTasks() data
- **Output**: 3 statistic cards
- **State**: Real-time calculation
- **Display**: Total, Pending, Completed

### DangerZoneCard
- **Input**: Sign out button
- **Output**: Calls useAuth.signOut()
- **Action**: Redirects to /login
- **Style**: Distinct danger styling

## Integration Points

### useAuth Hook (Existing)
```typescript
const { user, signOut, refetch } = useAuth();
```

### useTasks Hook (Existing)
```typescript
const { tasks } = useTasks();
```

### api Object (Extended)
```typescript
await api.updateProfile(data);
await api.changePassword(data);
await api.getTaskStats();
```

## Testing Checklist

- [ ] Profile form validates input
- [ ] Profile update shows success feedback
- [ ] Profile update handles errors
- [ ] Password form validates match
- [ ] Password change clears fields
- [ ] Account info displays correctly
- [ ] Task stats show accurate counts
- [ ] Task stats update in real-time
- [ ] Sign out redirects to login
- [ ] Mobile layout is responsive
- [ ] Desktop layout is 2-column
- [ ] All animations follow design system
- [ ] All colors match design tokens

## Common Issues & Solutions

### Issue: Form validation not working
**Solution**: Check `isValidEmail()` import and field requirements

### Issue: Real-time stats not updating
**Solution**: Ensure component re-renders when tasks array changes

### Issue: Layout not responsive
**Solution**: Use correct Tailwind breakpoints (`md:grid-cols-2`)

### Issue: Animation not smooth
**Solution**: Use existing easing curve `[0.22, 1, 0.36, 1]`

## Success Criteria

✅ All 5 sections implemented
✅ Responsive 2-column desktop / 1-column mobile
✅ Forms validate and submit correctly
✅ Real-time updates work
✅ Sign out redirects properly
✅ Design system followed exactly
✅ No console errors
✅ TypeScript types correct

---
**Status**: ✅ Ready for implementation
**Next**: Create tasks.md with `/sp.tasks` command