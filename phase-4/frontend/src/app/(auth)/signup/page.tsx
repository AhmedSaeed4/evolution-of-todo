'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fadeInUp } from '@/motion/variants';
import { useAuth } from '@/hooks/useAuth';
import { isAuthBypassEnabled } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect in bypass mode
  useEffect(() => {
    if (isAuthBypassEnabled()) {
      router.push('/tasks');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signUp(formData.name, formData.email, formData.password);

      if (result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Signup successful, waiting for auth state to settle...');
        }

        // Small delay to ensure auth state propagates before redirect
        // This prevents race conditions where ProtectedRoute might not see the updated state
        await new Promise(resolve => setTimeout(resolve, 150));

        if (process.env.NODE_ENV === 'development') {
          console.log('Redirecting to tasks after auth state settled');
        }

        router.push('/tasks');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything in bypass mode (will redirect)
  if (isAuthBypassEnabled()) {
    return null;
  }

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <Card className="space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-[#2A1B12] mb-2">Get Started</h1>
          <p className="text-[#5C4D45] font-sans text-sm">Create your account to start managing tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="John Doe"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="••••••••"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#FF6B4A] text-xs font-mono text-center"
            >
              {error}
            </motion.p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-[#2A1B12]/10">
          <p className="text-sm text-[#5C4D45] font-sans">
            Already have an account?{' '}
            <a href="/login" className="text-[#FF6B4A] hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}