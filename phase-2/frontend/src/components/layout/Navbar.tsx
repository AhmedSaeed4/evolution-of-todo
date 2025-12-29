'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User, ListTodo } from 'lucide-react';
import { isAuthBypassEnabled } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
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
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-2xl font-bold text-structure"
            >
              Todo.
            </motion.div>
            <ListTodo className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/tasks"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${pathname === '/tasks' ? 'text-accent' : 'text-structure hover:text-accent'
                }`}
            >
              Tasks
            </Link>
            <Link
              href="/profile"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${pathname === '/profile' ? 'text-accent' : 'text-structure hover:text-accent'
                }`}
            >
              Profile
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-xs font-mono opacity-70">
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
        </div>
      </div>
    </motion.nav>
  );
}