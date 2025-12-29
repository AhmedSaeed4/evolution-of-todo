'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { isAuthBypassEnabled } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If bypass is enabled, never redirect
    if (isAuthBypassEnabled()) {
      return;
    }

    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

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