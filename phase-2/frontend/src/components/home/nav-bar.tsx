'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuthState } from '@/hooks/use-auth-state';
import { hoverScale, tapScale } from '@/motion/patterns';
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

  // Enhanced scroll detection with smooth transition
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Spring for nav interactions - High damping to prevent bounce
  const navSpring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 30  // Increased from 25 to prevent bounce
  };

  // Brand entrance animation - Slower and smoother
  const brandVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.2,  // Slower: 0.8 → 1.2
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Link entrance animation - Slower
  const linkVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.0,  // Slower: 0.6 → 1.0
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Auth button container animation - Slower with wider stagger
  const authVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.0,  // Slower: 0.6 → 1.0
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.12  // Wider stagger: 0.05 → 0.12
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring" as const,
        stiffness: 200,
        damping: 30,
        mass: 0.8,
        duration: 1.2  // Slower entrance
      }}
      className={`sticky top-0 z-50 w-full transition-all duration-800 ease-[0.22,1,0.36,1] ${
        isScrolled
          ? 'bg-[#F9F7F2]/95 backdrop-blur-xl border-b border-[#2A1B12]/10 shadow-sm'
          : 'bg-[#F9F7F2]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand - Fixed with proper spring */}
          <motion.div
            variants={brandVariants}
            initial="hidden"
            animate="visible"
            className="font-serif text-2xl font-bold text-[#2A1B12]"
          >
            <motion.span
              whileHover={{ scale: 1.02 }}  // Reduced from 1.03 to 1.02 per skill
              transition={navSpring}
              className="inline-block"
            >
              {brandName}
            </motion.span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Middle Links - Enhanced with staggered entrance */}
            {session?.authenticated && (
              <motion.div
                variants={authVariants}
                initial="hidden"
                animate="visible"
                className="flex gap-6"
              >
                {navigationLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="font-mono text-xs uppercase tracking-widest text-[#2A1B12] hover:text-[#FF6B4A] transition-colors duration-300"
                    variants={linkVariants}
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                      color: '#FF6B4A'
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      scale: navSpring,
                      y: navSpring,
                      color: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                    }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </motion.div>
            )}

            {/* Right Section - Auth State with enhanced animations */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-24 h-8 bg-[#2A1B12]/10 rounded animate-pulse"
                />
              ) : session?.authenticated && session.user ? (
                <motion.div
                  variants={authVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-3"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    transition={navSpring}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}  // Reduced from 1.1 to 1.02, removed rotate
                      transition={navSpring}
                    >
                      <User className="w-4 h-4 text-[#2A1B12]" />
                    </motion.div>
                    <span className="font-mono text-xs text-[#2A1B12]">
                      {session.user.name}
                    </span>
                  </motion.div>
                  <motion.div
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = authActions.profileHref}
                    >
                      Profile
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  variants={authVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-3"
                >
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button variant="ghost" size="sm" onClick={() => window.location.href = '/login'}>
                      {authActions.signIn}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={hoverScale} whileTap={tapScale}>
                    <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>
                      {authActions.getStarted}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Fixed easing */}
          <motion.button
            whileTap={{ scale: 0.98 }}  // Changed from 0.9 to 0.98 per skill
            onClick={toggleMobileMenu}
            className="md:hidden text-[#2A1B12] relative z-50"
            aria-label="Toggle menu"
          >
            <motion.div
              initial={false}
              animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu - Slower and smoother */}
        <AnimatePresence mode="wait">
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
                transition: {
                  opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  height: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                }
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                  height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                }
              }}
              className="md:hidden border-t border-[#2A1B12]/10 overflow-hidden absolute left-0 right-0 top-16 bg-[#F9F7F2]/95 backdrop-blur-xl"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
                className="py-4 space-y-4 px-6"
              >
                {session?.authenticated && session.user && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08, delayChildren: 0.15 }
                      }
                    }}
                    className="space-y-3"
                  >
                    {navigationLinks.map((link) => (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        className="block font-mono text-sm uppercase tracking-widest text-[#2A1B12] hover:text-[#FF6B4A] transition-colors duration-300"
                        whileHover={{ x: 4 }}
                        transition={navSpring}
                      >
                        {link.label}
                      </motion.a>
                    ))}
                    <motion.div
                      className="pt-3 border-t border-[#2A1B12]/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.3 } }}
                    >
                      <motion.div
                        className="flex items-center gap-2 mb-3"
                        whileHover={{ x: 2 }}
                        transition={navSpring}
                      >
                        <User className="w-4 h-4 text-[#2A1B12]" />
                        <span className="font-mono text-xs text-[#2A1B12]">
                          {session.user.name}
                        </span>
                      </motion.div>
                      <motion.div whileHover={hoverScale} whileTap={tapScale}>
                        <Button
                          variant="ghost"
                          size="sm"
                          fullWidth
                          onClick={() => window.location.href = authActions.profileHref}
                        >
                          Profile
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {!session?.authenticated && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1, delayChildren: 0.15 }
                      }
                    }}
                    className="space-y-3"
                  >
                    <motion.div whileHover={hoverScale} whileTap={tapScale}>
                      <Button variant="ghost" size="sm" fullWidth onClick={() => window.location.href = '/login'}>
                        {authActions.signIn}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={hoverScale} whileTap={tapScale}>
                      <Button variant="primary" size="sm" fullWidth onClick={() => window.location.href = '/signup'}>
                        {authActions.getStarted}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}