'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLMotionProps<'span'> {
  variant?: 'high' | 'medium' | 'low' | 'work' | 'personal' | 'home' | 'other';
  children: React.ReactNode;
}

export function Badge({
  variant = 'medium',
  children,
  className,
  ...props
}: BadgeProps) {
  const variantColors = {
    high: 'bg-priority-high text-white',
    medium: 'bg-priority-medium text-white',
    low: 'bg-priority-low text-white',
    work: 'bg-category-work text-white',
    personal: 'bg-category-personal text-white',
    home: 'bg-category-home text-white',
    other: 'bg-category-other text-white',
  };

  return (
    <motion.span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wider',
        'border border-structure/10',
        variantColors[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.span>
  );
}