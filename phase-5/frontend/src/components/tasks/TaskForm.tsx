'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, CreateTaskDTO, Priority, Category, RecurringRule } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RecurringOptions } from './RecurringOptions';
import { DateTimePicker } from './DateTimePicker';
import { fadeInUp } from '@/motion/variants';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
  isLoading?: boolean;
}

// Explicit interface for form state - all fields must be strings, never undefined
interface TaskFormData {
  title: string;
  description: string;
  priority: string;
  category: string;
  dueDate: string;
  recurringRule: string;
  recurringEndDate: string;
  reminderAt: string;
  tags: string;
}

export function TaskForm({ task, onSubmit, onCancel, mode = 'create', isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    category: task?.category ?? 'personal',
    dueDate: task?.dueDate ?? '',
    // Always use empty strings, never undefined
    recurringRule: task?.recurringRule ?? '',
    recurringEndDate: task?.recurringEndDate ?? '',
    reminderAt: task?.reminderAt ?? '',
    tags: task?.tags?.join(', ') ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 100) newErrors.title = 'Title must be 100 characters or less';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Prepare submission data with new fields
      const submitData: any = mode === 'edit' && task
        ? { ...task, ...formData }
        : formData;

      // Process tags - split by comma and trim
      if (submitData.tags) {
        submitData.tags = submitData.tags
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter((t: string) => t.length > 0);
      }

      // Convert dueDate to date-only format (YYYY-MM-DD) for backend
      // The date input sends YYYY-MM-DD but when editing, the original task has full ISO datetime
      if (submitData.dueDate && submitData.dueDate.includes('T')) {
        submitData.dueDate = submitData.dueDate.split('T')[0];
      }

      // Remove empty fields
      if (!submitData.recurringRule) delete submitData.recurringRule;
      if (!submitData.recurringEndDate) delete submitData.recurringEndDate;
      if (!submitData.reminderAt) delete submitData.reminderAt;
      if (!submitData.tags || submitData.tags.length === 0) delete submitData.tags;

      onSubmit(submitData);
    }
  };

  const handleChange = (
    field: keyof TaskFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
        placeholder="Enter task title..."
        required
      />

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">
          Description
        </label>
        <motion.textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={cn(
            'w-full bg-background border p-4 font-sans text-sm rounded-sm resize-y min-h-[80px]',
            'border-structure/20 focus:border-accent focus:outline-none transition-colors'
          )}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          placeholder="Optional description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value as Priority)}
            className="w-full bg-background border border-structure/20 p-3 font-mono text-sm rounded-sm focus:border-accent focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value as Category)}
            className="w-full bg-background border border-structure/20 p-3 font-mono text-sm rounded-sm focus:border-accent focus:outline-none"
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="home">Home</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <Input
        label="Due Date"
        type="date"
        // Extract just the YYYY-MM-DD part from ISO datetime string
        value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
        onChange={(e) => handleChange('dueDate', e.target.value)}
      />

      {/* NEW: Recurring Options */}
      <RecurringOptions
        value={formData.recurringRule}
        onChange={(rule) => handleChange('recurringRule', rule)}
        endDate={formData.recurringEndDate}
        onEndDateChange={(date) => handleChange('recurringEndDate', date)}
      />

      {/* NEW: Reminder DateTime */}
      <DateTimePicker
        label="Reminder Time"
        value={formData.reminderAt}
        onChange={(date) => handleChange('reminderAt', date)}
      />

      {/* NEW: Tags Input */}
      <div>
        <label htmlFor="tags" className="block font-mono text-[10px] uppercase tracking-widest mb-2 opacity-60">
          Tags (optional)
        </label>
        <input
          id="tags"
          type="text"
          value={formData.tags || ''}
          onChange={(e) => handleChange('tags', e.target.value)}
          className={cn(
            'w-full bg-background border border-structure/20 p-3 font-mono text-sm rounded-sm',
            'focus:border-accent focus:outline-none transition-colors'
          )}
          placeholder="e.g., work, urgent, project (comma separated)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isLoading}
        >
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}