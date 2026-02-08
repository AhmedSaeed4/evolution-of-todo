'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputProps extends HTMLMotionProps<'input'> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  disabled,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">
          {label}
        </label>
      )}
      <motion.input
        value={props.value ?? ''}
        className={cn(
          'w-full bg-background border p-4 font-mono text-sm transition-colors',
          'border-structure/20 focus:border-accent focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-accent',
          className
        )}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-2 text-xs text-accent font-mono">{error}</p>
      )}
    </div>
  );
}