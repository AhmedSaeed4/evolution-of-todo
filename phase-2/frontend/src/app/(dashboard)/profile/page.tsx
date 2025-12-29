'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { fadeInUp } from '@/motion/variants';
import { User, Mail, Calendar } from 'lucide-react';
import { isAuthBypassEnabled } from '@/lib/auth';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

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
    name: 'Bypass User'
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2A1B12] mb-2">
          Profile
        </h1>
        <p className="text-[#5C4D45] font-sans">Manage your account information</p>
      </div>

      <Card className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-[#2A1B12]/10">
          <div className="w-12 h-12 bg-[#FF6B4A] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2A1B12]">{displayUser.name}</h2>
            <p className="text-sm text-[#5C4D45] font-mono">User ID: {displayUser.id}</p>
            {isAuthBypassEnabled() && (
              <p className="text-xs text-[#FF6B4A] font-mono mt-1">BYPASS MODE ACTIVE</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#2A1B12]">
            <Mail className="w-4 h-4 text-[#FF6B4A]" />
            <span className="font-sans">{displayUser.email}</span>
          </div>

          <div className="flex items-center gap-3 text-[#5C4D45]">
            <Calendar className="w-4 h-4 text-[#2A1B12]" />
            <span className="font-sans text-sm">Account created</span>
          </div>
        </div>

        <div className="bg-[#2A1B12]/5 p-4 rounded-sm">
          <p className="font-mono text-xs text-[#2A1B12]/70">
            {isAuthBypassEnabled()
              ? 'Bypass Mode: Mock authentication active (no backend required)'
              : 'Account Type: Mock Authentication (Ready for Backend Integration)'
            }
          </p>
        </div>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-sm text-[#5C4D45] font-sans"
      >
        <p>Need help? Contact support at support@todoapp.com</p>
      </motion.div>
    </motion.div>
  );
}