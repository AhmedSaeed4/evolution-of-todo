'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/motion/variants';
import { isAuthBypassEnabled } from '@/lib/auth';

export default function Home() {
  // Auto-redirect to tasks if bypass is enabled
  useEffect(() => {
    if (isAuthBypassEnabled()) {
      window.location.href = '/tasks';
    }
  }, []);

  // If bypass is enabled, don't render anything (will redirect)
  if (isAuthBypassEnabled()) {
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

  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
    >
      <motion.div variants={fadeInUp} className="text-center max-w-2xl">
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-structure mb-6">
          Todo.
        </h1>
        <p className="font-sans text-xl text-structure/70 mb-12">
          Modern task management with beautiful design and smooth animations.
        </p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login"
            className="px-8 py-3 bg-accent text-white font-sans font-medium rounded-editorial hover:bg-accent-hover transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 border-structure border-structure font-sans font-medium rounded-editorial hover:bg-surface transition-colors"
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
