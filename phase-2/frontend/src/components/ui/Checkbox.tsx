'use client';

import { motion } from 'framer-motion';
import { scaleIn } from '@/motion/variants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        className={cn(
          'w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors',
          checked ? 'bg-accent border-accent' : 'bg-transparent border-structure/20 hover:border-structure'
        )}
        onClick={() => onChange(!checked)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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