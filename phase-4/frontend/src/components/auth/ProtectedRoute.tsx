'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { isAuthBypassEnabled } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const redirectRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any pending redirects
    if (redirectRef.current) {
      clearTimeout(redirectRef.current);
      redirectRef.current = null;
    }

    // If bypass is enabled, never redirect
    if (isAuthBypassEnabled()) {
      return;
    }

    // Only redirect if we're done loading AND not authenticated
    if (!loading && !isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        console.log(`[${timestamp}] ProtectedRoute - scheduling redirect to login`);
      }

      // Use a small delay to catch any last-second state updates
      redirectRef.current = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('ProtectedRoute - executing redirect');
        }
        router.push('/login');
      }, 100);
    }
  }, [isAuthenticated, loading, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (redirectRef.current) {
        clearTimeout(redirectRef.current);
      }
    };
  }, []);

  // If bypass is enabled, skip loading state and render immediately
  if (isAuthBypassEnabled()) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#F9F7F2] flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}