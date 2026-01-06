# Component API Contracts: Homepage Design & Implementation

**Feature**: 008-homepage-design
**Date**: 2026-01-05
**Status**: Complete
**Version**: 1.0.0

## Overview

This document defines the public API contracts for all homepage components. These contracts ensure type safety, prop validation, and clear interfaces between components.

## Hero Section API

### Component: `HeroSection`

**File**: `phase-2/frontend/src/components/home/hero-section.tsx`

**Props Interface**:
```typescript
interface HeroSectionProps {
  /**
   * Main headline text - large serif typography
   * @required
   * @example "MASTER YOUR TASKS TODAY"
   */
  headline: string;

  /**
   * Supporting description text
   * @required
   * @example "Modern task management platform for clarity and productivity"
   */
  subtext: string;

  /**
   * Primary CTA button text
   * @required
   * @example "Start Free Trial"
   */
  ctaPrimary: string;

  /**
   * Secondary CTA button text
   * @required
   * @example "Watch Demo"
   */
  ctaSecondary: string;

  /**
   * Callback for primary button click
   * @required
   */
  onPrimaryClick: () => void;

  /**
   * Callback for secondary button click
   * @required
   */
  onSecondaryClick: () => void;

  /**
   * Optional: Custom animation delay
   * @default 0
   */
  animationDelay?: number;
}
```

**Usage Example**:
```typescript
import { HeroSection } from '@/components/home/hero-section';

export default function HomePage() {
  return (
    <HeroSection
      headline="MASTER YOUR TASKS TODAY"
      subtext="Modern task management platform for clarity and productivity"
      ctaPrimary="Start Free Trial"
      ctaSecondary="Watch Demo"
      onPrimaryClick={() => window.location.href = '/signup'}
      onSecondaryClick={() => alert('Demo modal would open here')}
    />
  );
}
```

**Animation Contract**:
- Headline: `fadeInUp` (0.8s delay)
- Subtext: `fadeInUp` (1.0s delay)
- Buttons: `fadeInUp` (1.2s delay), staggered by 0.1s

## Task Split Editor API

### Component: `TaskSplitEditor`

**File**: `phase-2/frontend/src/components/home/task-split-editor.tsx`

**Props Interface**:
```typescript
interface TaskSplitEditorProps {
  /**
   * Optional: Custom animation delay
   * @default 0
   */
  animationDelay?: number;

  /**
   * Optional: Custom height
   * @default 500px
   */
  height?: string;
}
```

**Internal Data Structure**:
```typescript
interface CodeLine {
  line: string;
  type: 'comment' | 'keyword' | 'property' | 'value' | 'symbol';
}

const codeLines: CodeLine[] = [
  { line: '// TaskFlow Configuration', type: 'comment' },
  { line: 'const task = {', type: 'keyword' },
  { line: '  title: "Build auth",', type: 'property' },
  { line: '  priority: "high",', type: 'property' },
  { line: '  status: "in-progress",', type: 'property' },
  { line: '  assignee: "you"', type: 'property' },
  { line: '};', type: 'symbol' },
  { line: 'await api.tasks.create(task);', type: 'keyword' }
];
```

**Usage Example**:
```typescript
import { TaskSplitEditor } from '@/components/home/task-split-editor';

export default function HeroRightColumn() {
  return <TaskSplitEditor />;
}
```

**Animation Contract**:
- **Code Editor**:
  - Lines type in sequentially (0.08s stagger)
  - Opacity fade from 0.3 → 1.0
  - Cursor blinks continuously
  - Syntax highlighting: Comments (gray), Keywords (orange), Properties (green), Values (amber), Symbols (teal)

- **Preview Panel**:
  - Slides in from right (0.6s duration)
  - Card builds up: Title → Tags → Progress bar → Timestamp
  - Success message appears last (delay: 3.2s)

- **Decorative Elements**:
  - Center separator line: `lineDraw` (0.6s)
  - Bottom dots: Orange → Dark gradient
  - Technical badge: Slide in from right
  - Corner accent: Fade in

**Color Palette**:
- Editor background: `#2A1B12` (dark)
- Preview background: `#F9F7F2` (cream)
- Accent: `#FF6B4A` (orange)
- Syntax colors: `#88C0D0`, `#A3BE8C`, `#EBCB8B`, `#D8DEE9`

**Easing**: All animations use `[0.22, 1, 0.36, 1]` smooth easing curve

## Features Grid API

### Component: `FeaturesGrid`

**File**: `phase-2/frontend/src/components/home/features-grid.tsx`

**Props Interface**:
```typescript
interface FeatureCardData {
  /**
   * Feature title
   * @required
   * @example "Zero Distractions"
   */
  title: string;

  /**
   * Feature description
   * @required
   * @example "Clean interface designed for deep work"
   */
  description: string;

  /**
   * Lucide icon name
   * @required
   * @example "Zap"
   */
  icon: string;

  /**
   * Hover effect type
   * @default "elevation"
   */
  hoverEffect?: 'elevation' | 'border' | 'scale';
}

interface FeaturesGridProps {
  /**
   * Array of 3 feature cards
   * @required
   * @minItems 3
   * @maxItems 3
   */
  features: FeatureCardData[];

  /**
   * Section heading
   * @required
   * @example "Core Features"
   */
  heading: string;

  /**
   * Section subtitle
   * @required
   * @example "Built for Focus"
   */
  subtitle: string;
}
```

**Usage Example**:
```typescript
import { FeaturesGrid } from '@/components/home/features-grid';

const features = [
  {
    title: "Zero Distractions",
    description: "Clean interface designed for deep work",
    icon: "Zap",
    hoverEffect: "elevation"
  },
  {
    title: "Lightning Sync",
    description: "Real-time updates across all devices",
    icon: "Cloud",
    hoverEffect: "border"
  },
  {
    title: "Secure by Default",
    description: "Enterprise-grade security built-in",
    icon: "Shield",
    hoverEffect: "scale"
  }
];

export default function FeaturesSection() {
  return (
    <FeaturesGrid
      features={features}
      heading="Core Features"
      subtitle="Built for Focus"
    />
  );
}
```

**Animation Contract**:
- Container: `staggerContainer` (0.1s delay between items)
- Each card: `fadeInUp` + `hoverScale` on interaction
- Icon: subtle rotation on hover (5 degrees)

### Component: `FeatureCard`

**File**: `src/components/home/feature-card.tsx` (internal)

**Props Interface**:
```typescript
interface FeatureCardProps {
  data: FeatureCardData;
  index: number; // For stagger calculation
}
```

## Tech Stack API

### Component: `TechStack`

**File**: `phase-2/frontend/src/components/home/tech-stack.tsx`

**Props Interface**:
```typescript
interface TechItemData {
  /**
   * Technology name
   * @required
   * @example "Next.js 16+"
   */
  name: string;

  /**
   * Technology description
   * @required
   * @example "React framework with App Router"
   */
  description: string;

  /**
   * Lucide icon name
   * @required
   * @example "Code"
   */
  icon: string;

  /**
   * Optional external link
   * @example "https://nextjs.org"
   */
  link?: string;
}

interface TechStackProps {
  /**
   * Section heading
   * @required
   * @example "Modern Technical Stack"
   */
  heading: string;

  /**
   * Array of technology items
   * @required
   * @minItems 1
   */
  technologies: TechItemData[];

  /**
   * Separator style between items
   * @default "line"
   */
  separator?: 'line' | 'dot';
}
```

**Usage Example**:
```typescript
import { TechStack } from '@/components/home/tech-stack';

const technologies = [
  {
    name: "Next.js 16+",
    description: "React framework with App Router",
    icon: "Code",
    link: "https://nextjs.org"
  },
  {
    name: "FastAPI",
    description: "Python backend framework",
    icon: "Server",
    link: "https://fastapi.tiangolo.com"
  },
  // ... more items
];

export default function TechSection() {
  return (
    <TechStack
      heading="Modern Technical Stack"
      technologies={technologies}
      separator="line"
    />
  );
}
```

**Animation Contract**:
- Items: `fadeInUp` with 0.15s stagger
- Separators: `lineDraw` (1.2s duration)
- Hover: subtle scale (1.01) + color accent

## Footer API

### Component: `Footer`

**File**: `phase-2/frontend/src/components/home/footer.tsx`

**Props Interface**:
```typescript
interface FooterNavigationItem {
  /**
   * Navigation label
   * @required
   * @example "Features"
   */
  label: string;

  /**
   * Navigation href
   * @required
   * @example "/features"
   */
  href: string;
}

interface SocialLink {
  /**
   * Platform name
   * @required
   */
  platform: 'x' | 'linkedin' | 'github';

  /**
   * Full URL
   * @required
   */
  url: string;

  /**
   * Lucide icon name
   * @required
   */
  icon: string;
}

interface FooterProps {
  /**
   * Brand/company name
   * @required
   */
  brandName: string;

  /**
   * Navigation links
   * @required
   * @minItems 1
   */
  navigation: FooterNavigationItem[];

  /**
   * Social media links
   * @required
   * @minItems 1
   */
  social: SocialLink[];

  /**
   * Copyright text
   * @required
   * @example "© 2025 Brand Name. All rights reserved."
   */
  copyright: string;
}
```

**Usage Example**:
```typescript
import { Footer } from '@/components/home/footer';

export default function FooterSection() {
  return (
    <Footer
      brandName="TaskFlow"
      navigation={[
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Docs", href: "/docs" },
        { label: "About", href: "/about" }
      ]}
      social={[
        { platform: "x", url: "https://x.com/taskflow", icon: "Twitter" },
        { platform: "linkedin", url: "https://linkedin.com/company/taskflow", icon: "Linkedin" },
        { platform: "github", url: "https://github.com/taskflow", icon: "Github" }
      ]}
      copyright="© 2025 TaskFlow. All rights reserved."
    />
  );
}
```

**Animation Contract**:
- Links: color transition to orange (#FF6B4A) on hover (0.3s)
- Social icons: scale up to 1.1 on hover
- No entrance animations (footer loads with page)

## Navigation Bar API

### Component: `NavBar`

**File**: `phase-2/frontend/src/components/home/nav-bar.tsx`

**Props Interface**:
```typescript
interface NavBarProps {
  /**
   * Brand/site name
   * @required
   * @example "TaskFlow"
   */
  brandName: string;

  /**
   * Navigation links (middle section)
   * @required
   */
  navigationLinks: Array<{
    label: string;    // "Tasks", "Profile"
    href: string;     // "/tasks", "/profile"
  }>;

  /**
   * Authentication action labels
   * @required
   */
  authActions: {
    signIn: string;       // "Sign In"
    getStarted: string;   // "Get Started"
    profileHref: string;  // "/profile"
  };

  /**
   * Optional: Custom className
   */
  className?: string;
}
```

**State Management Contract**:
```typescript
// Internal state interface
interface NavBarState {
  session: {
    authenticated: boolean;
    user?: {
      name: string;
      email: string;
    };
  };
  loading: boolean;
  mobileMenuOpen: boolean;
}

// Auth hook interface
interface UseAuthReturn {
  session: NavBarState['session'] | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Usage Example**:
```typescript
import { NavBar } from '@/components/home/nav-bar';

export default function Navigation() {
  return (
    <NavBar
      brandName="TaskFlow"
      navigationLinks={[
        { label: "Tasks", href: "/tasks" },
        { label: "Profile", href: "/profile" }
      ]}
      authActions={{
        signIn: "Sign In",
        getStarted: "Get Started",
        profileHref: "/profile"
      }}
    />
  );
}
```

**Animation Contract**:
- Dropdown: `fadeInUp` (0.3s)
- Hover states: smooth color transitions
- Mobile menu: slide-down animation

## Shared UI Components

### Button Component

**File**: `phase-2/frontend/src/components/ui/button.tsx`

**Props Interface**:
```typescript
interface ButtonProps {
  /**
   * Visual variant
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'technical';

  /**
   * Size variant
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Button content
   * @required
   */
  children: React.ReactNode;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * For Next.js Link integration
   */
  href?: string;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Full width
   * @default false
   */
  fullWidth?: boolean;
}
```

**Animation Contract**:
- `whileHover`: { scale: 1.02, y: -1 }
- `whileTap`: { scale: 0.98 }
- `transition`: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }

### Card Component

**File**: `phase-2/frontend/src/components/ui/card.tsx`

**Props Interface**:
```typescript
interface CardProps {
  /**
   * Card variant
   * @default "interactive"
   */
  variant?: 'feature' | 'tech' | 'interactive';

  /**
   * Card content
   * @required
   */
  children: React.ReactNode;

  /**
   * Enable hover effects
   * @default true
   */
  hoverable?: boolean;

  /**
   * Border style
   * @default "technical"
   */
  borderStyle?: 'none' | 'technical' | 'accent';

  /**
   * Optional click handler
   */
  onClick?: () => void;
}
```

**Animation Contract**:
- `whileHover`: { scale: 1.02, borderColor: "#FF6B4A" }
- `transition`: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }

## Integration Patterns

### Auth State Integration

All interactive components that depend on authentication state must use the following pattern:

```typescript
'use client';

import { useSession } from '@/lib/auth-client';

export function InteractiveComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingState />;
  }

  if (!session) {
    return <LoggedOutState />;
  }

  return <AuthenticatedState user={session.user} />;
}
```

### Animation Integration

All components must use the shared animation variants:

```typescript
import { motion } from 'framer-motion';
import { fadeInUp, hoverScale } from '@/motion/patterns';

export function AnimatedComponent() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      whileHover={hoverScale}
    >
      {/* Content */}
    </motion.div>
  );
}
```

## Testing Contracts

### Mock Data Contracts

```typescript
// Mock props for testing
export const mockHeroProps: HeroSectionProps = { /* ... */ };
export const mockTaskSplitEditorProps: TaskSplitEditorProps = { /* ... */ };
export const mockFeatures: FeatureCardData[] = [ /* ... */ ];
export const mockTechItems: TechItemData[] = [ /* ... */ ];
export const mockFooterProps: FooterProps = { /* ... */ };
export const mockNavBarProps: NavBarProps = { /* ... */ };

// Mock auth state
export const mockAuthState = {
  authenticated: true,
  user: { name: "Test User", email: "test@example.com" }
};

export const mockUnauthState = {
  authenticated: false
};
```

### Validation Utilities

```typescript
export function validateHeroProps(props: HeroSectionProps): boolean {
  return props.headline.length > 0 &&
         props.subtext.length > 0 &&
         typeof props.onPrimaryClick === 'function';
}

export function validateFeatures(features: FeatureCardData[]): boolean {
  return features.length === 3 &&
         features.every(f => f.title.length > 0);
}
```

## Version History

- **v1.0.0** (2026-01-05): Initial contract definition for homepage design feature 

---

**Note**: All components must strictly adhere to these contracts. Any changes require version bump and documentation update.