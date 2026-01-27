'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/motion/variants';
import { Search, Loader2 } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface TaskSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function TaskSearch({ onSearch, isLoading = false }: TaskSearchProps) {
  const [query, setQuery] = useState('');

  // Debounced search (300ms)
  const debouncedSearch = debounce((value: string) => {
    onSearch(value);
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
    // Cleanup
    return () => {
      // Type assertion to access cancel method
      (debouncedSearch as any).cancel?.();
    };
  }, [query]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <div className="flex items-center gap-2 bg-background border border-structure/20 rounded-sm px-4 py-3 focus-within:border-accent transition-colors">
        <Search className="w-4 h-4 text-structure/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 bg-transparent border-none outline-none font-sans text-sm placeholder:text-structure/40"
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        )}
      </div>

      {/* Loading skeleton for results */}
      {isLoading && query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-structure/10 rounded-sm p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
            <Loader2 className="w-3 h-3 animate-spin" />
            Searching...
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}