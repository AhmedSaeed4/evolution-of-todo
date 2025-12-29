'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { hoverScale } from '@/motion/variants';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'technical';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-mono text-xs uppercase tracking-widest transition-colors';

  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-transparent border border-structure text-structure hover:bg-structure hover:text-background',
    technical: 'bg-transparent border border-structure/20 text-structure hover:border-structure hover:bg-structure hover:text-background'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm'
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      whileHover={hoverScale.whileHover}
      whileTap={hoverScale.whileTap}
      transition={hoverScale.transition as any}
      {...props}
    >
      {children}
    </motion.button>
  );
}