'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { fadeInUp, hoverScale } from '@/motion/variants';
import { LogOut } from 'lucide-react';

export default function DangerZoneCard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);

    try {
      const result = await signOut();

      if (result.success) {
        // Redirect to login
        router.push('/login');
      } else {
        alert(result.error || 'Failed to sign out');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showConfirm) {
      if (e.key === 'Enter' && !loading) {
        e.preventDefault();
        handleSignOut();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    }
  };

  return (
    // Add keyboard listener to the container
    <div onKeyDown={handleKeyDown}>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-[#FFF5F2] border border-[#FF6B4A]/30">
          <div className="space-y-4">
            {/* Header */}
            <div className="border-b border-[#FF6B4A]/20 pb-3">
              <h2 className="font-serif text-2xl font-bold text-[#2A1B12]">
                Danger Zone
              </h2>
              <p className="text-sm text-[#5C4D45] font-sans mt-1">
                Sign out of your account
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Confirmation State */}
              {showConfirm ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
                  className="bg-[#FF6B4A]/10 border border-[#FF6B4A]/30 rounded-sm p-4"
                >
                  <p className="font-sans text-sm text-[#2A1B12] mb-4">
                    Are you sure you want to sign out? Any unsaved changes will be lost.
                  </p>

                  <div className="flex gap-3">
                    <motion.button
                      {...hoverScale}
                      onClick={handleSignOut}
                      disabled={loading}
                      className="flex-1 px-6 py-2.5 bg-[#FF6B4A] text-white rounded-sm font-sans font-medium hover:bg-[#E55A3D] transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Signing Out...' : 'Confirm Sign Out'}
                    </motion.button>

                    <motion.button
                      {...hoverScale}
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-6 py-2.5 bg-white border border-[#2A1B12]/20 text-[#2A1B12] rounded-sm font-sans font-medium hover:bg-[#2A1B12]/5 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                /* Normal State */
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-sans text-sm text-[#2A1B12]">
                      Click the button to securely sign out of your account.
                    </p>
                  </div>

                  <motion.button
                    {...hoverScale}
                    onClick={handleSignOut}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B4A] text-white rounded-sm font-sans font-medium hover:bg-[#E55A3D] transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    <span>{loading ? 'Signing Out...' : 'Sign Out'}</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Security Note */}
            <div className="bg-[#2A1B12]/5 p-3 rounded-sm">
              <p className="font-mono text-xs text-[#2A1B12]/70">
                Session will be cleared and you'll be redirected to login
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}