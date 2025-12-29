'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, CreateTaskDTO, Priority, Category } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fadeInUp } from '@/motion/variants';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  mode?: 'create' | 'edit';
}

export function TaskForm({ task, onSubmit, onCancel, mode = 'create' }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium' as Priority,
    category: task?.category || 'personal' as Category,
    dueDate: task?.dueDate || '',
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
      const submitData = mode === 'edit' && task
        ? { ...task, ...formData }
        : formData;
      onSubmit(submitData);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | Priority | Category
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
        value={formData.dueDate}
        onChange={(e) => handleChange('dueDate', e.target.value)}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {mode === 'create' ? 'Create Task' : 'Update Task'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </motion.form>
  );
}