'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { fadeInUp } from '@/motion/variants';
import { Calendar, Clock, Pencil, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => Promise<void> | void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  index?: number;
}

export function TaskCard({ task, onToggle, onEdit, onDelete, index = 0 }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const priorityColors = {
    high: 'border-l-4 border-priority-high',
    medium: 'border-l-4 border-priority-medium',
    low: 'border-l-4 border-priority-low',
  };

  const handleToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await onToggle(task.id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={index}
      className={cn(
        'bg-background border border-structure/10 p-4 rounded-sm',
        'hover:shadow-md transition-shadow duration-300',
        priorityColors[task.priority]
      )}
    >
      <motion.div
        layout
        animate={{
          scale: task.completed ? 0.98 : 1,
          opacity: task.completed ? 0.6 : 1
        }}
        transition={{
          duration: 0.2,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="flex items-start gap-3"
      >
        <div className="relative flex items-center justify-center">
          {isUpdating ? (
            <div className="w-5 h-5 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            </div>
          ) : (
            <Checkbox
              checked={task.completed}
              onChange={handleToggle}
              disabled={isUpdating}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn(
                'font-sans text-sm font-medium text-structure mb-1',
                task.completed && 'line-through decoration-structure/50'
              )}>
                {task.title}
              </h4>

              {task.description && (
                <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Badge variant={task.priority}>{task.priority}</Badge>
                <Badge variant={task.category}>{task.category}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" strokeWidth={1.5} />
                    <span className="uppercase tracking-widest opacity-60">Due:</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  <span className="uppercase tracking-widest opacity-60">Created:</span>
                  <span>{formatDate(task.createdAt)}</span>
                </div>

                {task.updatedAt !== task.createdAt && (
                  <div className="flex items-center gap-1 text-accent">
                    <Pencil className="w-3 h-3" strokeWidth={1.5} />
                    <span className="uppercase tracking-widest opacity-80">Updated:</span>
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              <motion.button
                onClick={() => onEdit(task)}
                className="p-1.5 hover:bg-structure/10 rounded transition-colors text-[10px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Edit
              </motion.button>
              <motion.button
                onClick={() => onDelete(task.id)}
                className="p-1.5 hover:bg-accent/10 text-accent rounded transition-colors text-[10px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Delete
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}