'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { staggerContainer } from '@/motion/variants';
import { Button } from '@/components/ui/Button';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onCreate?: () => void;
}

export function TaskList({ tasks, onToggle, onEdit, onDelete, onCreate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative py-20 px-8"
      >
        {/* Technical Lines - Top */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="absolute top-0 left-0 right-0 h-px bg-structure/10 origin-left"
        />

        {/* Technical Lines - Decorative */}
        <div className="absolute top-8 left-8 w-12 h-12">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="absolute top-0 left-0 w-full h-px bg-accent/40 origin-left"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="absolute top-0 left-0 w-px h-full bg-accent/40 origin-top"
          />
        </div>

        {/* Content */}
        <div className="text-center max-w-lg mx-auto">
          {/* Massive Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="font-serif text-5xl md:text-6xl font-bold text-structure tracking-tight mb-4"
          >
            Start Fresh
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="text-text-secondary font-sans mb-10"
          >
            Create your first task to get organized
          </motion.p>

          {/* CTA */}
          {onCreate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
            >
              <Button onClick={onCreate} variant="primary" size="lg">
                + Create First Task
              </Button>
            </motion.div>
          )}
        </div>

        {/* Technical Lines - Bottom Right */}
        <div className="absolute bottom-8 right-8 w-12 h-12">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="absolute bottom-0 right-0 w-full h-px bg-accent/40 origin-right"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
            className="absolute bottom-0 right-0 w-px h-full bg-accent/40 origin-bottom"
          />
        </div>

        {/* Technical Lines - Bottom */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="absolute bottom-0 left-0 right-0 h-px bg-structure/10 origin-right"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            index={index}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}