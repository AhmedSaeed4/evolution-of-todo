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

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
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
      const result = await signIn(formData.email, formData.password);

      if (result.success) {
        // Small delay to ensure auth state propagates before redirect
        // This prevents race conditions where ProtectedRoute might not see the updated state
        await new Promise(resolve => setTimeout(resolve, 150));

        router.push('/tasks');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Invalid email or password');
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
          <h1 className="font-serif text-3xl font-bold text-[#2A1B12] mb-2">Welcome Back</h1>
          <p className="text-[#5C4D45] font-sans text-sm">Sign in to manage your tasks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-[#2A1B12]/10">
          <p className="text-sm text-[#5C4D45] font-sans">
            Don't have an account?{' '}
            <a href="/signup" className="text-[#FF6B4A] hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}