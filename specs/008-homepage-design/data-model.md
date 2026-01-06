# Data Model: Homepage Design & Implementation

**Feature**: 008-homepage-design
**Date**: 2026-01-05
**Status**: Complete

## Component Interface Definitions

### Hero Section

```typescript
interface HeroSectionProps {
  headline: string;           // "MASTER YOUR TASKS TODAY"
  subtext: string;            // Supporting description
  ctaPrimary: string;         // "Start Free Trial"
  ctaSecondary: string;       // "Watch Demo"
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

interface HeroAnimationState {
  headlineVisible: boolean;
  subtextVisible: boolean;
  buttonsVisible: boolean;
}
```

### Features Grid

```typescript
interface FeatureCard {
  title: string;              // "Zero Distractions", etc.
  description: string;
  icon: string;               // Lucide icon name
  hoverEffect: 'elevation' | 'border' | 'scale';
}

interface FeaturesGridProps {
  features: FeatureCard[];
  heading: string;            // "Core Features"
  subtitle: string;           // "Built for Focus"
}

interface FeatureAnimationState {
  staggerDelay: number;       // 0.1s per card
  hoverScale: number;         // 1.02 max
}
```

### Tech Stack Section

```typescript
interface TechItem {
  name: string;               // "Next.js 16+"
  description: string;
  icon: string;               // Lucide icon name
  link?: string;              // Optional external link
}

interface TechStackProps {
  heading: string;            // "Modern Technical Stack"
  technologies: TechItem[];
  separator: 'line' | 'dot';  // Visual separator style
}

interface TechStackAnimationState {
  revealDelay: number;        // 0.15s per item
  lineDrawDuration: number;   // 1.2s for dividers
}
```

### Footer Component

```typescript
interface FooterNavigation {
  label: string;              // "Features", "Pricing", etc.
  href: string;
}

interface SocialLink {
  platform: 'x' | 'linkedin' | 'github';
  url: string;
  icon: string;               // Lucide icon name
}

interface FooterProps {
  brandName: string;
  navigation: FooterNavigation[];
  social: SocialLink[];
  copyright: string;          // "© 2025 Brand Name. All rights reserved."
}

interface FooterAnimationState {
  hoverColor: string;         // #FF6B4A (orange accent)
  transitionDuration: number; // 0.3s
}
```

### Navigation Bar

```typescript
interface UserState {
  authenticated: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface NavBarProps {
  brandName: string;
  navigationLinks: Array<{
    label: string;            // "Tasks", "Profile"
    href: string;
  }>;
  authActions: {
    signIn: string;           // "Sign In"
    getStarted: string;       // "Get Started"
    profileHref: string;      // "/profile"
  };
}

interface NavBarState {
  session: UserState;
  loading: boolean;
  mobileMenuOpen: boolean;
}

// Auth state hook interface
interface UseAuthStateReturn {
  session: UserState | null;
  isLoading: boolean;
  error: Error | null;
}
```

## Shared UI Components

### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'technical';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;              // For Next.js Link
  disabled?: boolean;
  loading?: boolean;
}

// Animation variants for buttons
interface ButtonAnimation {
  whileHover: {
    scale: number;            // 1.02 for primary, 1.01 for others
    y?: number;               // -1 for subtle lift
  };
  whileTap: {
    scale: number;            // 0.98
  };
  transition: {
    duration: number;         // 0.3s
    ease: [number, number, number, number]; // [0.22, 1, 0.36, 1]
  };
}
```

### Card Component

```typescript
interface CardProps {
  variant: 'feature' | 'tech' | 'interactive';
  children: React.ReactNode;
  hoverable?: boolean;
  borderStyle?: 'none' | 'technical' | 'accent';
}

interface CardAnimation {
  initial: {
    opacity: number;
    y: number;
  };
  animate: {
    opacity: number;
    y: number;
  };
  whileHover?: {
    scale: number;
    borderColor?: string;
    boxShadow?: string;
  };
  transition: {
    duration: number;
    ease: [number, number, number, number];
  };
}
```

## Animation Variants

### Core Animation Patterns

```typescript
// From UI Animation skill
interface AnimationVariant {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit?: Record<string, number | string>;
  transition?: {
    duration?: number;
    ease?: [number, number, number, number] | string;
    delay?: number;
    staggerChildren?: number;
  };
}

// Exported variants
export const fadeInUp: AnimationVariant;
export const lineDraw: AnimationVariant;
export const staggerContainer: AnimationVariant;
export const hoverScale: AnimationVariant;
```

## State Management Interfaces

### Application State

```typescript
interface AppState {
  auth: {
    session: UserState | null;
    loading: boolean;
    error: Error | null;
  };
  ui: {
    mobileMenuOpen: boolean;
    theme: 'light' | 'dark';  // Future: dark mode support
  };
  performance: {
    pageLoadTime: number;
    animationFrameRate: number;
  };
}

// Context interface for auth state
interface AuthContextType {
  session: UserState | null;
  isLoading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

## Data Flow

### Component Hierarchy

```
App Root (Server Component)
└── AuthProvider (Client Component)
    ├── NavBar (Client Component)
    │   ├── LoggedOutNav (Conditional)
    │   └── LoggedInNav (Conditional)
    ├── HeroSection (Client Component)
    ├── FeaturesGrid (Client Component)
    │   └── FeatureCard (Client Component) ×3
    ├── TechStack (Client Component)
    │   └── TechItem (Client Component) ×4
    └── Footer (Client Component)
```

### Auth State Propagation

1. **Root Layout** (Server): Renders `<AuthProvider>`
2. **AuthProvider** (Client): Uses `useSession()` from Better Auth
3. **Child Components**: Consume auth state via props or context
4. **NavBar**: Conditionally renders based on `session.authenticated`

### Animation State Flow

1. **Page Load**: All components start with `initial` state
2. **Mount**: Components animate to `animate` state with staggered delays
3. **Interaction**: Hover states trigger `whileHover` variants
4. **Navigation**: Exit animations for smooth transitions

## Validation Rules

### Component Props Validation

```typescript
// Hero Section
const validateHeroProps = (props: HeroSectionProps): boolean => {
  return props.headline.length > 0 &&
         props.subtext.length > 0 &&
         props.ctaPrimary.length > 0 &&
         typeof props.onPrimaryClick === 'function';
};

// Features Grid
const validateFeatures = (features: FeatureCard[]): boolean => {
  return features.length === 3 &&
         features.every(f => f.title.length > 0 && f.description.length > 0);
};

// Auth State
const validateUserState = (state: UserState): boolean => {
  if (state.authenticated && !state.user) return false;
  if (state.authenticated && !state.user?.name) return false;
  return true;
};
```

## Performance Metrics

### Component Load Targets

```typescript
interface PerformanceBudget {
  heroSection: {
    fcp: number;              // < 1.5s
    lcp: number;              // < 2.0s
  };
  featuresGrid: {
    renderTime: number;       // < 0.5s
    animationFPS: number;     // > 55fps
  };
  overall: {
    totalLoad: number;        // < 2.0s
    cls: number;              // < 0.1
    inputDelay: number;       // < 100ms
  };
}
```

## Testing Interfaces

### Mock Data Structures

```typescript
// For testing
export const mockHeroProps: HeroSectionProps = {
  headline: "MASTER YOUR TASKS TODAY",
  subtext: "Modern task management platform for clarity and productivity",
  ctaPrimary: "Start Free Trial",
  ctaSecondary: "Watch Demo",
  onPrimaryClick: jest.fn(),
  onSecondaryClick: jest.fn()
};

export const mockFeatures: FeatureCard[] = [
  {
    title: "Zero Distractions",
    description: "Clean interface designed for deep work",
    icon: "Zap",
    hoverEffect: "elevation"
  },
  // ... more mock data
];

export const mockAuthState: UserState = {
  authenticated: true,
  user: {
    name: "Test User",
    email: "test@example.com"
  }
};
```

This data model provides complete TypeScript interfaces for all homepage components, ensuring type safety and clear contracts between components. All interfaces align with the Modern Technical Editorial design system and animation patterns.