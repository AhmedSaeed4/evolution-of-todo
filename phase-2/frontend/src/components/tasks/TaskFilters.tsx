'use client';

import { motion } from 'framer-motion';
import { TaskFilters as TaskFiltersType, Priority, TaskStatus, Category } from '@/types';
import { fadeInUp } from '@/motion/variants';
import { Select } from '@/components/ui/Select';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const handleFilterChange = (key: keyof TaskFiltersType, value: string | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-background border border-structure/10 p-4 rounded-sm space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          label="Status"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        <Select
          label="Priority"
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />

        <Select
          label="Category"
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'work', label: 'Work' },
            { value: 'personal', label: 'Personal' },
            { value: 'home', label: 'Home' },
            { value: 'other', label: 'Other' },
          ]}
        />

        <Select
          label="Sort By"
          value={filters.sortBy || ''}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          options={[
            { value: '', label: 'Default' },
            { value: 'dueDate', label: 'Due Date' },
            { value: 'priority', label: 'Priority' },
            { value: 'title', label: 'Title' },
            { value: 'createdAt', label: 'Created Date' },
          ]}
        />
      </div>

      {filters.sortBy && (
        <div className="flex items-center gap-2 pt-2 border-t border-structure/10">
          <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">Order:</span>
          <button
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="font-mono text-xs px-3 py-1 bg-structure/5 hover:bg-structure/10 rounded transition-colors"
          >
            {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      )}
    </motion.div>
  );
}