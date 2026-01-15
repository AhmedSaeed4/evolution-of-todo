'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesGrid } from '@/components/home/features-grid';
import { TechStack } from '@/components/home/tech-stack';
import { Footer } from '@/components/home/footer';
import { NavBar } from '@/components/home/nav-bar';

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Smooth scroll behavior and progress tracking
  useEffect(() => {
    // Enable smooth scrolling for the entire document
    document.documentElement.style.scrollBehavior = 'smooth';

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 500);
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Hero data
  const heroData = {
    headline: "PRODUCTIVITY MEETS INTELLIGENCE",
    subtext: "A modern task management platform designed for clarity, focus, and productivity.",
    ctaPrimary: "GET STARTED",
    ctaSecondary: "SOURCE CODE",
    ctaTertiary: "TRY CHATBOT"
  };

  // Features data
  const featuresData = {
    heading: "Core Features",
    subtitle: "Built for Focus",
    features: [
      {
        title: "Zero Distractions",
        description: "Clean interface designed for deep work without clutter",
        icon: "Zap"
      },
      {
        title: "Lightning Sync",
        description: "Real-time updates across all your devices instantly",
        icon: "Cloud"
      },
      {
        title: "Secure by Default",
        description: "Enterprise-grade security protecting your data",
        icon: "Shield"
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
    brandName: "TaskStack",
    navigation: [
      { label: "Features", href: "#features" },
      { label: "Chatbot", href: "/chatbot" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-saeed-0278a12b5/" },
      { label: "Docs", href: "https://github.com/AhmedSaeed4/evolution-of-todo.git" },
      { label: "About", href: "#hero" }
    ],
    social: [
      { platform: "x" as const, url: "https://x.com/taskflow", icon: "Twitter" },
      { platform: "linkedin" as const, url: "https://www.linkedin.com/in/ahmed-saeed-0278a12b5/", icon: "Linkedin" },
      { platform: "github" as const, url: "https://github.com/AhmedSaeed4/evolution-of-todo.git", icon: "Github" }
    ],
    copyright: "© 2025 TaskStack. All rights reserved."
  };

  // Navbar data
  const navBarData = {
    brandName: "TaskStack",
    navigationLinks: [
      { label: "Tasks", href: "/tasks" },
      { label: "Chatbot", href: "/chatbot" }
    ],
    authActions: {
      signIn: "Sign In",
      getStarted: "Get Started",
      profileHref: "/profile"
    }
  };

  return (
    <main className="scroll-smooth">
      {/* Scroll Progress Indicator - Slower and smoother */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-[#FF6B4A] z-[9999] origin-left"
        style={{ scaleX: scrollProgress / 100 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Background scroll indicator dots - Slower transitions */}
      <motion.div
        className="fixed right-6 top-1/2 -translate-y-1/2 z-[9998] flex flex-col gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress > 0 ? 0.6 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="w-1.5 h-1.5 rounded-full bg-[#2A1B12]/20"
            animate={{
              scale: scrollProgress > (index + 1) * 20 ? 1.5 : 1,
              opacity: scrollProgress > (index + 1) * 20 ? 1 : 0.3,
              backgroundColor: scrollProgress > (index + 1) * 20 ? '#FF6B4A' : '#2A1B12'
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: index * 0.08
            }}
          />
        ))}
      </motion.div>

      {/* Scroll to Top Button - Slower entrance */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[9999] w-12 h-12 bg-[#FF6B4A] text-white rounded-full shadow-lg flex items-center justify-center"
            transition={{
              type: "spring" as const,
              stiffness: 300,
              damping: 30,
              duration: 1.0  // Slower entrance
            }}
            aria-label="Scroll to top"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <NavBar {...navBarData} />
      <HeroSection
        id="hero"
        headline={heroData.headline}
        subtext={heroData.subtext}
        ctaPrimary={heroData.ctaPrimary}
        ctaSecondary={heroData.ctaSecondary}
        ctaTertiary={heroData.ctaTertiary}
        onPrimaryClick={() => window.location.href = '/tasks'}
        onSecondaryClick={() => window.open('https://github.com/AhmedSaeed4/evolution-of-todo.git', '_blank', 'noopener,noreferrer')}
        onTertiaryClick={() => window.location.href = '/chatbot'}
      />
      <FeaturesGrid id="features" {...featuresData} />
      <TechStack id="tech" {...techStackData} />
      <Footer {...footerData} />
    </main>
  );
}