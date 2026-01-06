# Quickstart Guide: Homepage Design & Implementation

**Feature**: 008-homepage-design
**Date**: 2026-01-05
**Status**: Complete

## Prerequisites

### Required Environment
- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm
- Git for version control

### Existing Dependencies
This feature uses existing project dependencies:
- `next` (16.1.1+)
- `react` (18+)
- `react-dom`
- `tailwindcss`
- `framer-motion`
- `lucide-react`
- `better-auth`

**No new packages need to be installed.**

## Setup Commands

### 1. Verify Dependencies
```bash
# From project root
npm list framer-motion lucide-react better-auth
# Should show these packages are installed
```

### 2. Create Directory Structure
```bash
# Navigate to phase-2/frontend/src/components
cd phase-2/frontend/src/components

# Create home directory for homepage components
mkdir -p home

# Create UI directory for shared components (if not exists)
mkdir -p ui

# Create animation directories
cd ../
mkdir -p motion
mkdir -p hooks
```

### 3. Verify Auth Configuration
```bash
# Check if auth client exists
ls frontend/src/lib/auth.ts

# If not, create it (see implementation section below)
```

## Implementation Steps

### Step 1: Create Animation Patterns

**File**: `phase-2/frontend/src/motion/patterns.ts`

```typescript
import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

export const lineDraw: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] }
  }
};

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
};
```

### Step 2: Create Auth State Hook

**File**: `phase-2/frontend/src/hooks/use-auth-state.ts`

```typescript
'use client';

import { useSession } from '@/lib/auth-client';

export function useAuthState() {
  const { data: session, isPending: isLoading, error } = useSession();

  return {
    session: session ? {
      authenticated: true,
      user: {
        name: session.user.name,
        email: session.user.email
      }
    } : null,
    isLoading,
    error
  };
}
```

### Step 3: Create Shared UI Components

**File**: `phase-2/frontend/src/components/ui/button.tsx`

```typescript
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { hoverScale } from '@/motion/patterns';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'technical';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-mono text-xs uppercase tracking-widest rounded-full transition-colors';
  const variantClasses = {
    primary: 'bg-[#FF6B4A] text-white hover:bg-[#E55A3D]',
    secondary: 'border border-[#2A1B12] bg-transparent hover:bg-[#2A1B12] hover:text-[#F9F7F2]',
    ghost: 'hover:bg-[#F0EBE0]',
    technical: 'border border-[#2A1B12]/20 hover:border-[#FF6B4A]'
  }[variant];

  const sizeClasses = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm'
  }[size];

  return (
    <motion.button
      whileHover={hoverScale}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${loading ? 'opacity-50 cursor-wait' : ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? 'LOADING...' : children}
    </motion.button>
  );
}
```

**File**: `phase-2/frontend/src/components/ui/card.tsx`

```typescript
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeInUp, hoverScale } from '@/motion/patterns';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'feature' | 'tech' | 'interactive';
  hoverable?: boolean;
  borderStyle?: 'none' | 'technical' | 'accent';
}

export function Card({
  variant = 'interactive',
  hoverable = true,
  borderStyle = 'technical',
  children,
  className = '',
  ...props
}: CardProps) {
  const borderClasses = {
    none: 'border-0',
    technical: 'border border-[#2A1B12]/10',
    accent: 'border border-[#FF6B4A]'
  }[borderStyle];

  const baseClasses = `bg-[#F9F7F2] rounded-lg p-6 ${borderClasses}`;

  if (!hoverable) {
    return (
      <div className={`${baseClasses} ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      whileHover={hoverScale}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Step 4: Create Homepage Components

**File**: `phase-2/frontend/src/components/home/hero-section.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/motion/patterns';

interface HeroSectionProps {
  headline: string;
  subtext: string;
  ctaPrimary: string;
  ctaSecondary: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function HeroSection({
  headline,
  subtext,
  ctaPrimary,
  ctaSecondary,
  onPrimaryClick,
  onSecondaryClick
}: HeroSectionProps) {
  return (
    <section className="relative py-32 px-6 border-b border-[#2A1B12]/10 overflow-hidden">
      {/* Technical Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-[#2A1B12]/5 top-1/3 absolute" />
        <div className="h-px w-full bg-[#2A1B12]/5 top-2/3 absolute" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-serif text-[clamp(3rem,8vw,7rem)] leading-[0.9] tracking-tighter text-[#2A1B12]"
        >
          {headline.split('<br />').map((line, i) => (
            <span key={i} className="block">
              {line}
              {i === 1 && <span className="text-[#FF6B4A] ml-[10%]">TODAY</span>}
            </span>
          ))}
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-xl text-lg text-[#5C4D45] font-sans border-l-2 border-[#FF6B4A] pl-6"
        >
          {subtext}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
          className="mt-12 flex gap-4 flex-wrap"
        >
          <Button variant="primary" size="lg" onClick={onPrimaryClick}>
            {ctaPrimary}
          </Button>
          <Button variant="secondary" size="lg" onClick={onSecondaryClick}>
            {ctaSecondary}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
```

**File**: `phase-2/frontend/src/components/home/features-grid.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { fadeInUp, hoverScale } from '@/motion/patterns';
import { Zap, Cloud, Shield } from 'lucide-react';

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  hoverEffect?: 'elevation' | 'border' | 'scale';
}

interface FeaturesGridProps {
  features: FeatureCard[];
  heading: string;
  subtitle: string;
}

const iconMap = {
  Zap: Zap,
  Cloud: Cloud,
  Shield: Shield
};

export function FeaturesGrid({ features, heading, subtitle }: FeaturesGridProps) {
  const container = {
    animate: {
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-24 px-6 bg-[#F9F7F2]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-[#2A1B12] mb-2">
            {heading}
          </h2>
          <p className="font-mono text-sm text-[#FF6B4A] uppercase tracking-widest">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];

            return (
              <motion.div key={index} variants={item} whileHover={hoverScale}>
                <Card variant="feature" borderStyle="technical">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {IconComponent && (
                      <IconComponent
                        className="w-8 h-8 text-[#FF6B4A]"
                        strokeWidth={2}
                      />
                    )}
                    <h3 className="font-serif text-xl text-[#2A1B12]">
                      {feature.title}
                    </h3>
                    <p className="text-[#5C4D45] font-sans text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
```

**File**: `phase-2/frontend/src/components/home/tech-stack.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { fadeInUp, lineDraw } from '@/motion/patterns';
import { Code, Server, Database, Lock } from 'lucide-react';

interface TechItem {
  name: string;
  description: string;
  icon: string;
  link?: string;
}

interface TechStackProps {
  heading: string;
  technologies: TechItem[];
  separator?: 'line' | 'dot';
}

const iconMap = {
  Code: Code,
  Server: Server,
  Database: Database,
  Lock: Lock
};

export function TechStack({ heading, technologies, separator = 'line' }: TechStackProps) {
  const container = {
    animate: {
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="font-serif text-4xl md:text-5xl text-[#2A1B12] text-center mb-16"
        >
          {heading}
        </motion.h2>

        <motion.div
          variants={container}
          initial="initial"
          animate="animate"
          className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4"
        >
          {technologies.map((tech, index) => {
            const IconComponent = iconMap[tech.icon as keyof typeof iconMap];
            const isLast = index === technologies.length - 1;

            return (
              <motion.div key={index} variants={item} className="flex-1 w-full">
                <div className="flex flex-col items-center text-center space-y-3 h-full">
                  {IconComponent && (
                    <IconComponent
                      className="w-6 h-6 text-[#2A1B12]"
                      strokeWidth={1.5}
                    />
                  )}
                  <h3 className="font-mono text-sm uppercase tracking-widest text-[#2A1B12]">
                    {tech.name}
                  </h3>
                  <p className="text-[#5C4D45] font-sans text-xs leading-relaxed">
                    {tech.description}
                  </p>
                </div>

                {!isLast && separator === 'line' && (
                  <motion.div
                    variants={lineDraw}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="hidden md:block absolute right-0 top-1/2 h-px bg-[#2A1B12]/20 w-full origin-left"
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
```

**File**: `phase-2/frontend/src/components/home/footer.tsx`

```typescript
'use client';

import { Twitter, Linkedin, Github } from 'lucide-react';

interface FooterNavigationItem {
  label: string;
  href: string;
}

interface SocialLink {
  platform: 'x' | 'linkedin' | 'github';
  url: string;
  icon: string;
}

interface FooterProps {
  brandName: string;
  navigation: FooterNavigationItem[];
  social: SocialLink[];
  copyright: string;
}

const iconMap = {
  Twitter: Twitter,
  Linkedin: Linkedin,
  Github: Github
};

export function Footer({ brandName, navigation, social, copyright }: FooterProps) {
  return (
    <footer className="bg-[#F0EBE0] pt-24 pb-8 px-6 border-t border-[#2A1B12]/10">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
          {navigation.map((item, index) => (
            <div key={index}>
              <h4 className="font-mono text-xs uppercase tracking-widest mb-6 opacity-60">
                {item.label}
              </h4>
              <ul className="space-y-3 font-sans opacity-80">
                <li>
                  <a
                    href={item.href}
                    className="hover:text-[#FF6B4A] transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2A1B12]/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif text-[15vw] leading-none opacity-90 tracking-tight md:text-[10vw]">
            {brandName}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Social Links */}
            <div className="flex gap-4">
              {social.map((link, index) => {
                const IconComponent = iconMap[link.icon as keyof typeof iconMap];
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2A1B12] hover:text-[#FF6B4A] transition-colors duration-300"
                  >
                    {IconComponent && (
                      <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <p className="text-sm text-[#5C4D45] font-sans">
              {copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**File**: `phase-2/frontend/src/components/home/nav-bar.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/hooks/use-auth-state';
import { fadeInUp } from '@/motion/patterns';
import { Menu, X, User } from 'lucide-react';

interface NavBarProps {
  brandName: string;
  navigationLinks: Array<{ label: string; href: string }>;
  authActions: {
    signIn: string;
    getStarted: string;
    profileHref: string;
  };
}

export function NavBar({ brandName, navigationLinks, authActions }: NavBarProps) {
  const { session, isLoading } = useAuthState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-[#F9F7F2]/95 backdrop-blur-xl border-b border-[#2A1B12]/10' : 'bg-[#F9F7F2]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-serif text-2xl font-bold text-[#2A1B12]"
          >
            {brandName}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Middle Links */}
            {session?.authenticated && (
              <div className="flex gap-6">
                {navigationLinks.map((link) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="font-mono text-xs uppercase tracking-widest text-[#2A1B12] hover:text-[#FF6B4A] transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            )}

            {/* Right Section - Auth State */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-24 h-8 bg-[#2A1B12]/10 rounded animate-pulse" />
              ) : session?.authenticated ? (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#2A1B12]" />
                    <span className="font-mono text-xs text-[#2A1B12]">
                      {session.user.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = authActions.profileHref}
                  >
                    Profile
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  className="flex gap-3"
                >
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/signin'}>
                    {authActions.signIn}
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>
                    {authActions.getStarted}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleMobileMenu}
            className="md:hidden text-[#2A1B12]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#2A1B12]/10 overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {session?.authenticated && (
                  <div className="space-y-3">
                    {navigationLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="block font-mono text-sm uppercase tracking-widest text-[#2A1B12] hover:text-[#FF6B4A]"
                      >
                        {link.label}
                      </a>
                    ))}
                    <div className="pt-3 border-t border-[#2A1B12]/10">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-[#2A1B12]" />
                        <span className="font-mono text-xs text-[#2A1B12]">
                          {session.user.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => window.location.href = authActions.profileHref}
                      >
                        Profile
                      </Button>
                    </div>
                  </div>
                )}

                {!session?.authenticated && (
                  <div className="space-y-3">
                    <Button variant="ghost" size="sm" fullWidth onClick={() => window.location.href = '/signin'}>
                      {authActions.signIn}
                    </Button>
                    <Button variant="primary" size="sm" fullWidth onClick={() => window.location.href = '/signup'}>
                      {authActions.getStarted}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
```

### Step 5: Create Main Homepage

**File**: `phase-2/frontend/src/app/page.tsx`

```typescript
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesGrid } from '@/components/home/features-grid';
import { TechStack } from '@/components/home/tech-stack';
import { Footer } from '@/components/home/footer';
import { NavBar } from '@/components/home/nav-bar';

export default function HomePage() {
  // Hero data
  const heroData = {
    headline: "MASTER YOUR TASKS TODAY",
    subtext: "A modern task management platform designed for clarity, focus, and productivity.",
    ctaPrimary: "Start Free Trial",
    ctaSecondary: "Watch Demo"
  };

  // Features data
  const featuresData = {
    heading: "Core Features",
    subtitle: "Built for Focus",
    features: [
      {
        title: "Zero Distractions",
        description: "Clean interface designed for deep work without clutter",
        icon: "Zap",
        hoverEffect: "elevation" as const
      },
      {
        title: "Lightning Sync",
        description: "Real-time updates across all your devices instantly",
        icon: "Cloud",
        hoverEffect: "border" as const
      },
      {
        title: "Secure by Default",
        description: "Enterprise-grade security protecting your data",
        icon: "Shield",
        hoverEffect: "scale" as const
      }
    ]
  };

  // Tech stack data
  const techStackData = {
    heading: "Modern Technical Stack",
    technologies: [
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
      {
        name: "Neon",
        description: "Serverless PostgreSQL",
        icon: "Database",
        link: "https://neon.tech"
      },
      {
        name: "Better Auth",
        description: "Authentication framework",
        icon: "Lock",
        link: "https://better-auth.com"
      }
    ]
  };

  // Footer data
  const footerData = {
    brandName: "TaskFlow",
    navigation: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/docs" },
      { label: "About", href: "/about" }
    ],
    social: [
      { platform: "x" as const, url: "https://x.com/taskflow", icon: "Twitter" },
      { platform: "linkedin" as const, url: "https://linkedin.com/company/taskflow", icon: "Linkedin" },
      { platform: "github" as const, url: "https://github.com/taskflow", icon: "Github" }
    ],
    copyright: "© 2025 TaskFlow. All rights reserved."
  };

  // Navbar data
  const navBarData = {
    brandName: "TaskFlow",
    navigationLinks: [
      { label: "Tasks", href: "/tasks" },
      { label: "Profile", href: "/profile" }
    ],
    authActions: {
      signIn: "Sign In",
      getStarted: "Get Started",
      profileHref: "/profile"
    }
  };

  return (
    <main>
      <NavBar {...navBarData} />
      <HeroSection
        headline={heroData.headline}
        subtext={heroData.subtext}
        ctaPrimary={heroData.ctaPrimary}
        ctaSecondary={heroData.ctaSecondary}
        onPrimaryClick={() => window.location.href = '/signup'}
        onSecondaryClick={() => alert('Demo modal would open here')}
      />
      <FeaturesGrid {...featuresData} />
      <TechStack {...techStackData} />
      <Footer {...footerData} />
    </main>
  );
}
```

## Testing Commands

### Component Tests

```bash
# Run component tests
cd phase-2/frontend
npm test -- --testPathPattern="home"

# Run specific component test
npm test -- --testPathPattern="hero-section"

# Watch mode
npm test -- --watch
```

### E2E Tests

```bash
# Run E2E tests
cd phase-2/frontend
npm run cypress:run

# Open Cypress UI
npm run cypress:open

# Run specific E2E test
npm run cypress:run -- --spec "cypress/e2e/homepage.spec.ts"
```

### Performance Tests

```bash
# Lighthouse CI
cd phase-2/frontend
npm run lighthouse -- http://localhost:3000

# Page load timing
npm run build && npm start
# Then check browser DevTools > Performance
```

## Validation Steps

### 1. Visual Design Validation
```bash
# Start development server
cd phase-2/frontend
npm run dev

# Visit http://localhost:3000
# Verify:
# - Cream background (#F9F7F2)
# - Orange accents (#FF6B4A)
# - Typography: Playfair, DM Sans, JetBrains Mono
# - Technical lines/borders
```

### 2. Animation Validation
```bash
# Open browser DevTools
# Check:
# - Fade-in animations on page load
# - Hover effects (scale 1.02, color changes)
# - 60fps performance
# - No layout shifts
```

### 3. Authentication State Validation
```bash
# Test logged-out state
# - Should see "Sign In" and "Get Started" buttons
# - Middle navigation should be hidden

# Test logged-in state
# - Should see user name and "Profile" link
# - Should see "Tasks" and "Profile" navigation
```

### 4. Responsive Validation
```bash
# Test breakpoints:
# - Mobile: < 768px (stacked layout, hamburger menu)
# - Tablet: 768px - 1024px (grid adjustments)
# - Desktop: > 1024px (full layout)
```

## Troubleshooting

### Common Issues

**Issue**: Animations not working
- **Solution**: Verify `framer-motion` is installed and components use `'use client'`

**Issue**: Auth state not updating
- **Solution**: Check Better Auth client configuration in `src/lib/auth.ts`

**Issue**: Tailwind styles not applied
- **Solution**: Verify `tailwind.config.js` includes custom colors:
  ```js
  theme: {
    extend: {
      colors: {
        cream: '#F9F7F2',
        espresso: '#2A1B12',
        accent: '#FF6B4A'
      }
    }
  }
  ```

**Issue**: Performance issues
- **Solution**: Use React DevTools Profiler to identify slow components, implement code splitting

## Success Criteria

✅ **All components render correctly**
✅ **Animations run at 60fps**
✅ **Auth state transitions work**
✅ **Mobile responsiveness verified**
✅ **Design tokens applied correctly**
✅ **Tests pass (component + E2E)**
✅ **Performance budget met (<2s load)**

## Next Steps

Once implementation is complete:
1. Run full test suite
2. Performance audit with Lighthouse
3. Accessibility audit with axe-core
4. Code review and merge
5. Deploy to staging for final validation

---

**Estimated Time**: 2-3 hours for complete implementation
**Difficulty**: Intermediate (requires Next.js, React, TypeScript knowledge)