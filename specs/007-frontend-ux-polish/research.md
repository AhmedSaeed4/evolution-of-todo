# Research: Frontend UX Polish & Enhancements

**Feature**: 007-frontend-ux-polish
**Date**: 2025-12-31
**Status**: Phase 0 Complete

---

## Technology Decisions & Rationale

### 1. Sonner Toast Library

**Decision**: Install `sonner@2.0.0` (latest stable)

**Rationale**:
- Lightweight (2.9kb gzipped) - minimal bundle impact
- Built for React with TypeScript support
- Supports custom positioning, duration, and styling
- No external dependencies beyond React
- Matches requirement for bottom-right positioning (FR-004)
- Supports auto-dismiss (FR-005) and error messages (FR-006)

**Alternatives Considered**:
- **react-hot-toast**: More popular but heavier (12kb), less modern API
- **react-toastify**: Feature-rich but larger bundle, more complex setup
- **Custom implementation**: Would violate "no reinventing wheels" principle

**Integration Pattern**:
```tsx
// Root layout
<Toaster position="bottom-right" duration={4000} richColors />

// Usage in hooks
import { toast } from 'sonner';
toast.success("Task created");
toast.error(error.message);
```

---

### 2. Framer Motion Animation Strategy

**Decision**: Extend existing `motion/variants.ts` patterns

**Current State**:
- ✅ `fadeInUp` - Used for task card entrance
- ✅ `scaleIn` - For checkboxes (spring physics)
- ✅ `hoverScale` - For interactive elements
- ✅ Editorial ease curve: `[0.22, 1, 0.36, 1]`

**New Animation Requirements**:
- **Task completion toggle**: Scale effect on checkbox click
- **State transitions**: Smooth opacity/strikethrough changes
- **Performance**: 60fps, no layout thrashing

**Implementation Strategy**:
```tsx
// TaskCard.tsx - Add motion wrapper
<motion.div
  animate={{
    scale: task.completed ? 0.98 : 1,
    opacity: task.completed ? 0.6 : 1
  }}
  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
>
  {/* content */}
</motion.div>
```

**Performance Considerations**:
- Use `layout` prop for smooth reordering
- Avoid animating layout properties (width, height)
- Use `transform` only (scale, opacity, translate)
- Leverage existing editorial easing for consistency

---

### 3. Date Display Enhancement

**Decision**: Update TaskCard date section with labels and conditional rendering

**Current State** (lines 72-84):
```tsx
<div className="flex items-center gap-3 text-[10px] font-mono opacity-60">
  {task.dueDate && (
    <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      <span>{formatDate(task.dueDate)}</span>
    </div>
  )}
  <div className="flex items-center gap-1">
    <Clock className="w-3 h-3" />
    <span>{formatDate(task.createdAt)}</span>
  </div>
</div>
```

**Required Changes**:
- Add text labels: "Due:", "Created:", "Updated:"
- Import `Pencil` icon from lucide-react
- Conditional rendering: `task.updatedAt !== task.createdAt`
- Apply Modern Technical Editorial styling

**Design Alignment**:
- ✅ Typography: `font-mono text-[10px] uppercase tracking-widest`
- ✅ Icons: `strokeWidth={1.5}` (Technical feel)
- ✅ Colors: Use `text-accent` for updated date
- ✅ Spacing: `gap-1.5` for better readability

---

### 4. Toast Integration Points

**Decision**: Add toast calls to existing hooks without breaking existing API

**useTasks.ts Integration**:
```tsx
import { toast } from 'sonner';

// In createTask:
toast.success("Task created");

// In updateTask:
toast.success("Task updated");

// In deleteTask:
toast.success("Task deleted");

// In toggleTask:
toast.success(task.completed ? "Task completed" : "Task reopened");

// In error handlers:
toast.error(error.message);
```

**AuthContext.tsx Integration**:
```tsx
// In signIn:
toast.success("Welcome back!");

// In signOut:
toast.info("Logged out");

// In changePassword:
toast.success("Password changed successfully");

// In error handlers:
toast.error(error.message);
```

**Architecture Compliance**:
- ✅ No state changes in toast calls (pure feedback)
- ✅ Error messages from API passed through (FR-006)
- ✅ All CRUD operations covered (FR-003)
- ✅ Auth events covered (User Story 2)

---

## Constitution Compliance Check

### ✅ PASSED: All Gates

| Principle | Compliance | Evidence |
|-----------|------------|----------|
| **I. Universal Logic Decoupling** | ✅ | Toast calls added to hooks, not business logic |
| **II. AI-Native Interoperability** | ✅ | No MCP changes needed (frontend-only) |
| **III. Strict Statelessness** | ✅ | Toasts are ephemeral UI feedback only |
| **IV. Event-Driven Decoupling** | ✅ | Not applicable (frontend-only feature) |
| **V. Zero-Trust Multi-Tenancy** | ✅ | No data access changes |
| **VI. Technology Stack** | ✅ | Sonner is authorized, no conflicts |
| **VII. Security** | ✅ | No secrets, no input validation changes |
| **VIII. Observability** | ✅ | Toasts provide user-level feedback |

**No constitutional violations requiring ADR.**

---

## Integration Complexity Assessment

### Low Risk Changes
- ✅ **Sonner installation**: Standard npm package
- ✅ **Toaster in layout**: Single component addition
- ✅ **Date labels**: UI-only enhancement
- ✅ **Toast calls**: Non-breaking additions to existing functions

### Medium Risk Changes
- ⚠️ **Task animation**: Requires testing for performance
- ⚠️ **State synchronization**: Ensure toast timing matches UI updates

### Mitigation Strategies
- Use existing Framer Motion patterns
- Test animation performance with browser dev tools
- Verify toast timing doesn't conflict with state updates
- Maintain existing component API surface

---

## Dependencies Summary

### New Dependencies
| Package | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| `sonner` | ^2.0.0 | Toast notifications | ~2.9kb gzipped |

### Existing Dependencies Used
| Package | Current Version | Usage |
|---------|-----------------|-------|
| `framer-motion` | ^12.23.26 | Task completion animation |
| `lucide-react` | ^0.562.0 | Pencil icon for updated dates |
| `next` | 16.1.1 | App Router layout |
| `typescript` | ^5 | Type safety |

---

## Testing Strategy

### Unit Tests (Not Required)
- Toast functionality is library-provided
- Date formatting is straightforward
- Animation logic is declarative

### Manual Testing Plan
1. **Toast Notifications**: Verify all 6 action types trigger correct toasts
2. **Date Labels**: Check conditional rendering and formatting
3. **Animations**: Verify smooth 60fps performance
4. **Integration**: Ensure no breaking changes to existing functionality

### Performance Validation
- Use Chrome DevTools Performance tab
- Check for layout thrashing during animations
- Verify no memory leaks from toast instances
- Confirm bundle size increase is acceptable

---

## Implementation Priority

### Phase 1: Foundation (P1)
1. Install Sonner
2. Add Toaster to root layout
3. Add toast calls to useTasks.ts
4. Add toast calls to AuthContext.tsx

### Phase 2: UI Enhancements (P1)
1. Update TaskCard date display
2. Add Pencil icon import

### Phase 3: Animations (P2)
1. Add motion wrapper to TaskCard
2. Implement scale effect on toggle
3. Add transition for opacity/strikethrough

---

## Research Complete ✅

**All unknowns resolved. Ready for Phase 1: Design & Contracts.**

- ✅ Technology choices validated
- ✅ Integration patterns defined
- ✅ Constitution compliance verified
- ✅ Risk assessment completed
- ✅ Testing strategy outlined