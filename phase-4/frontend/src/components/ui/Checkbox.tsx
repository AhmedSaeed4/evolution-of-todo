'use client';

import { motion } from 'framer-motion';
import { scaleIn } from '@/motion/variants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <div className={cn("flex items-center gap-3", disabled && "opacity-50 cursor-not-allowed")}>
      <motion.button
        type="button"
        disabled={disabled}
        className={cn(
          'w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors',
          checked
            ? 'bg-accent border-accent'
            : 'bg-transparent border-structure/20',
          !disabled && !checked && 'hover:border-structure',
          disabled && 'cursor-not-allowed'
        )}
        onClick={() => !disabled && onChange(!checked)}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>
      {label && (
        <span className="text-sm font-sans text-structure">{label}</span>
      )}
    </div>
  );
}