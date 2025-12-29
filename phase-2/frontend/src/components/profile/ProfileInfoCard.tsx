'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { fadeInUp, hoverScale } from '@/motion/variants';
import { validateProfileForm } from '@/lib/utils';

interface ProfileInfoCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ProfileInfoCard({ user }: ProfileInfoCardProps) {
  const { updateProfile } = useAuth();

  // Form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes from original values
  useEffect(() => {
    const hasNameChange = name.trim() !== user.name;
    setHasChanges(hasNameChange);
  }, [name, user.name]);

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
    const validation = validateProfileForm(name, email);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Check if there are actual changes
    if (!hasChanges) {
      setErrors(['No changes detected']);
      return;
    }

    setLoading(true);

    try {
      const result = await updateProfile({ name: name.trim() });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setErrors([]);
      } else {
        setErrors([result.error || 'Failed to update profile']);
      }
    } catch (error) {
      setErrors(['An unexpected error occurred']);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName(user.name);
    setEmail(user.email);
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
              Profile Information
            </h2>
            <p className="text-sm text-text-secondary font-sans mt-1">
              Update your name and email address
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block font-mono text-xs uppercase tracking-widest text-structure opacity-70"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-structure/20 rounded-sm font-sans text-structure focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Enter your name"
                disabled={loading}
                aria-required="true"
                aria-invalid={errors.some(e => e.toLowerCase().includes('name'))}
                aria-describedby={errors.some(e => e.toLowerCase().includes('name')) ? "name-error" : undefined}
              />
            </div>

            {/* Email Display (Read-only) */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block font-mono text-xs uppercase tracking-widest text-structure opacity-70"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="w-full px-4 py-3 bg-structure/5 border border-structure/10 rounded-sm font-sans text-structure/60 cursor-not-allowed"
                aria-readonly="true"
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
                disabled={!hasChanges || loading}
                className={`flex-1 px-6 py-3 rounded-sm font-sans font-medium transition-all ${hasChanges && !loading
                  ? 'bg-accent text-white hover:bg-accent-hover'
                  : 'bg-structure/10 text-structure/40 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </motion.button>

              <motion.button
                {...hoverScale}
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || loading}
                className="px-6 py-3 rounded-sm font-sans font-medium border border-structure/20 text-structure hover:bg-structure/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </motion.button>
            </div>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}