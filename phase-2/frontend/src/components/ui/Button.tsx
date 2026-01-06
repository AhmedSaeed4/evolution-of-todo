'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'technical';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
  href?: string;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  isLoading,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-transparent border border-structure text-structure hover:bg-structure hover:text-background',
    ghost: 'hover:bg-surface',
    technical: 'bg-transparent border border-structure/20 text-structure hover:border-structure hover:bg-structure hover:text-background'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      whileHover={!isLoading && !props.disabled ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!isLoading && !props.disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </motion.button>
  );
}