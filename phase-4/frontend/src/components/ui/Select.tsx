'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelectProps extends HTMLMotionProps<'select'> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className,
  value,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">
          {label}
        </label>
      )}
      <motion.select
        className={cn(
          'w-full bg-background border p-3 font-mono text-sm rounded-sm transition-colors',
          'border-structure/20 focus:border-accent focus:outline-none',
          error && 'border-accent',
          className
        )}
        value={value}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <p className="mt-2 text-xs text-accent font-mono">{error}</p>
      )}
    </div>
  );
}