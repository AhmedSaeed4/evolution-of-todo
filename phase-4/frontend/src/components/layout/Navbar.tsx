'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User, ListTodo } from 'lucide-react';
import { isAuthBypassEnabled } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    // In bypass mode, redirect back to tasks instead of login
    if (isAuthBypassEnabled()) {
      router.push('/tasks');
    } else {
      router.push('/login');
    }
  };

  // Close mobile menu when route changes
  if (isMobileMenuOpen) {
    // This side effect should be in a useEffect, but we can just close it on click links
  }

  // In bypass mode, always show navbar
  if (!isAuthBypassEnabled() && !isAuthenticated) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-structure/10"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/tasks"
            className="flex items-center gap-2 group z-50 relative"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-2xl font-bold text-structure"
            >
              TaskStack
            </motion.div>
            <ListTodo className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/tasks"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${pathname === '/tasks' ? 'text-accent' : 'text-structure hover:text-accent'
                }`}
            >
              Tasks
            </Link>
            <Link
              href="/chatbot"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${pathname === '/chatbot' ? 'text-accent' : 'text-structure hover:text-accent'
                }`}
            >
              Agent
            </Link>
            <Link
              href="/profile"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${pathname === '/profile' ? 'text-accent' : 'text-structure hover:text-accent'
                }`}
            >
              Profile
            </Link>
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-xs font-mono opacity-70">
                <User className="w-3 h-3" />
                <span>{user.name}</span>
                {isAuthBypassEnabled() && (
                  <span className="text-accent ml-1">(Bypass)</span>
                )}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-3 h-3 mr-1" />
              {isSigningOut ? 'Signing Out...' : 'Logout'}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 relative p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-structure block origin-center"
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-structure block"
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-structure block origin-center"
              />
            </div>
          </button>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '100vh' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 top-0 left-0 bg-background z-40 md:hidden pt-24 px-4"
              >
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-4">
                    <Link
                      href="/tasks"
                      className={`font-mono text-xl uppercase tracking-widest transition-colors ${pathname === '/tasks' ? 'text-accent' : 'text-structure'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Tasks
                    </Link>
                    <Link
                      href="/chatbot"
                      className={`font-mono text-xl uppercase tracking-widest transition-colors ${pathname === '/chatbot' ? 'text-accent' : 'text-structure'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Agent
                    </Link>
                    <Link
                      href="/profile"
                      className={`font-mono text-xl uppercase tracking-widest transition-colors ${pathname === '/profile' ? 'text-accent' : 'text-structure'
                        }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </div>

                  <div className="h-px bg-structure/10 w-full" />

                  <div className="flex flex-col space-y-4">
                    {user && (
                      <div className="flex items-center gap-2 text-sm font-mono opacity-70">
                        <User className="w-4 h-4" />
                        <span>{user.name}</span>
                        {isAuthBypassEnabled() && (
                          <span className="text-accent ml-1">(Bypass)</span>
                        )}
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full justify-start"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      disabled={isSigningOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isSigningOut ? 'Signing Out...' : 'Logout'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}