'use client';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'feature' | 'tech' | 'interactive';
  hoverable?: boolean;
  borderStyle?: 'none' | 'technical' | 'accent';
}

export function Card({
  children,
  variant = 'interactive',
  hoverable = true,
  borderStyle = 'technical',
  className,
  ...props
}: CardProps) {
  // Border styles
  const borderClasses = {
    none: 'border-0',
    technical: 'border border-structure/10',
    accent: 'border border-accent'
  }[borderStyle];

  // Base classes
  const baseClasses = `bg-background ${borderClasses} p-6`;

  // Variant-specific styling
  const variantClasses = {
    feature: 'text-center',
    tech: 'flex flex-col items-center text-center',
    interactive: ''
  }[variant];

  // Combined classes
  const combinedClasses = cn(baseClasses, variantClasses, className);

  // Hoverable component (static, no animations)
  if (hoverable) {
    return (
      <div
        className={cn(combinedClasses, 'cursor-pointer')}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Non-hoverable static div
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}