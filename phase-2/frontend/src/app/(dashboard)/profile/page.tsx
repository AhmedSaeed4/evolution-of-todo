'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { fadeInUp, staggerContainer } from '@/motion/variants';
import { User } from 'lucide-react';
import { isAuthBypassEnabled } from '@/lib/auth';

// Import profile components
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import PasswordChangeCard from '@/components/profile/PasswordChangeCard';
import AccountInfoCard from '@/components/profile/AccountInfoCard';
import TaskStatsCard from '@/components/profile/TaskStatsCard';
import DangerZoneCard from '@/components/profile/DangerZoneCard';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Only redirect if bypass is disabled
    if (!isAuthBypassEnabled() && !isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Skip auth check in bypass mode
  if (!isAuthBypassEnabled() && (!isAuthenticated || !user)) {
    return null;
  }

  // In bypass mode, use mock user if user is null
  const displayUser = user || {
    id: 'bypass-user',
    email: 'bypass@example.com',
    name: 'Bypass User',
    createdAt: new Date().toISOString()
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto px-4"
    >
      {/* Header Section */}
      <div className="text-center space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
          className="font-serif text-4xl md:text-5xl font-bold text-structure"
        >
          Profile Settings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.6, delay: 0.1 }}
          className="text-text-secondary font-sans text-lg"
        >
          Manage your account information, security, and preferences
        </motion.p>

        {/* User Quick Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: 0.15 }}
          className="inline-block mt-4"
        >
          <Card className="bg-surface border border-structure/10 inline-flex items-center gap-4 px-6 py-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="text-left">
              <p className="font-serif text-xl font-bold text-structure">{displayUser.name}</p>
              <p className="text-sm text-text-secondary font-mono">{displayUser.email}</p>
              {isAuthBypassEnabled() && (
                <p className="text-xs text-accent font-mono mt-1">BYPASS MODE ACTIVE</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left Column */}
        <div className="space-y-6">
          <ProfileInfoCard user={displayUser} />
          <PasswordChangeCard />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AccountInfoCard />
          <TaskStatsCard />
          <DangerZoneCard />
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0.2 }}
        className="text-center text-sm text-text-secondary font-sans pt-4 border-t border-structure/10"
      >
        <p>Need help? Contact support at <a href="mailto:support@todoapp.com" className="text-accent hover:underline">support@todoapp.com</a></p>
        {isAuthBypassEnabled() && (
          <p className="font-mono text-xs text-structure/50 mt-2">
            Mock Mode: All operations use local state (no backend required)
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}