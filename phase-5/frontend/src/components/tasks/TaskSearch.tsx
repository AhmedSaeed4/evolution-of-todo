'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/motion/variants';
import { Search, Loader2, X, Tag } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { parseSearchWithTags, formatTags } from '@/lib/tagSearch';

interface TaskSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function TaskSearch({ onSearch, isLoading = false }: TaskSearchProps) {
  const [query, setQuery] = useState('');

  // Parse tags from query for display
  const { tags } = useMemo(() => parseSearchWithTags(query), [query]);

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
          placeholder="Search tasks... Try #work #urgent"
          className="flex-1 bg-transparent border-none outline-none font-sans text-sm placeholder:text-structure/40"
        />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
        )}
      </div>

      {/* Active tags display */}
      {tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 mt-2"
        >
          <span className="text-xs text-text-secondary font-mono">Tags:</span>
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-sm text-xs font-mono"
            >
              <Tag className="w-3 h-3" />
              #{tag}
            </span>
          ))}
        </motion.div>
      )}

      {/* Tag hint for new users */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-2 text-xs text-text-secondary"
        >
          <Tag className="w-3 h-3" />
          <span>Use <span className="font-mono text-accent">#tag</span> syntax to filter by tags</span>
        </motion.div>
      )}

      {/* Loading skeleton for results */}
      {isLoading && query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-background border border-structure/10 rounded-sm p-3 shadow-sm z-10"
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