'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { fadeInUp, hoverScale } from '@/motion/variants';
import { validatePasswordForm } from '@/lib/utils';

export default function PasswordChangeCard() {
  const { changePassword } = useAuth();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  // Track form validity
  useEffect(() => {
    const validation = validatePasswordForm(currentPassword, newPassword, confirmPassword);
    setCanSubmit(validation.valid);
  }, [currentPassword, newPassword, confirmPassword]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    // Validate form
    const validation = validatePasswordForm(currentPassword, newPassword, confirmPassword);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword({
        currentPassword,
        newPassword
      });

      if (result.success) {
        setSuccess('Password changed successfully!');
        setErrors([]);
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrors([result.error || 'Failed to change password']);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred']);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors([]);
    setSuccess('');
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-surface border border-structure/10">
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-structure/10 pb-4">
            <h2 className="font-serif text-2xl font-bold text-structure">
              Change Password
            </h2>
            <p className="text-sm text-text-secondary font-sans mt-1">
              Update your password for account security
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="block font-mono text-xs uppercase tracking-widest text-structure opacity-70"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-structure/20 rounded-sm font-sans text-structure focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Enter current password"
                disabled={loading}
                aria-required="true"
                aria-invalid={errors.some(e => e.toLowerCase().includes('current'))}
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block font-mono text-xs uppercase tracking-widest text-structure opacity-70"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-structure/20 rounded-sm font-sans text-structure focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Minimum 8 characters"
                disabled={loading}
                aria-required="true"
                aria-invalid={errors.some(e => e.toLowerCase().includes('new'))}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block font-mono text-xs uppercase tracking-widest text-structure opacity-70"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-structure/20 rounded-sm font-sans text-structure focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Re-enter new password"
                disabled={loading}
                aria-required="true"
                aria-invalid={errors.some(e => e.toLowerCase().includes('confirm') || e.toLowerCase().includes('match'))}
              />
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
                className="bg-accent/10 border border-accent/30 rounded-sm p-3"
              >
                <ul className="text-sm text-accent font-sans space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
                className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-sm p-3"
              >
                <p className="text-sm text-[#10B981] font-sans">{success}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                {...hoverScale}
                type="submit"
                disabled={!canSubmit || loading}
                className={`flex-1 px-6 py-3 rounded-sm font-sans font-medium transition-all ${
                  canSubmit && !loading
                    ? 'bg-accent text-white hover:bg-accent-hover'
                    : 'bg-structure/10 text-structure/40 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </motion.button>

              <motion.button
                {...hoverScale}
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 rounded-sm font-sans font-medium border border-structure/20 text-structure hover:bg-structure/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </motion.button>
            </div>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}