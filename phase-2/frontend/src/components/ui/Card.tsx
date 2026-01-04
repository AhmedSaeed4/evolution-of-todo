'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({
  children,
  hoverable = false,
  className,
  ...props
}: CardProps) {
  const baseClasses = 'bg-background border border-structure/10 p-6';

  if (hoverable) {
    return (
      <motion.div
        className={cn(baseClasses, 'cursor-pointer', className)}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] } as any}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(baseClasses, className)}>
      {children}
    </div>
  );
}