'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/Card';
import { fadeInUp, staggerContainer, scaleIn } from '@/motion/variants';

interface Stat {
  label: string;
  value: number;
  color: string;
}

export default function TaskStatsCard() {
  const { tasks } = useTasks();
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Total', value: 0, color: 'text-structure' },
    { label: 'Pending', value: 0, color: 'text-priority-medium' },
    { label: 'Completed', value: 0, color: 'text-priority-low' },
  ]);

  // Calculate stats whenever tasks change
  useEffect(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    setStats([
      { label: 'Total', value: total, color: 'text-structure' },
      { label: 'Pending', value: pending, color: 'text-priority-medium' },
      { label: 'Completed', value: completed, color: 'text-priority-low' },
    ]);
  }, [tasks]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="bg-surface border border-structure/10">
        <div className="space-y-4">
          {/* Header */}
          <div className="border-b border-structure/10 pb-3">
            <h2 className="font-serif text-2xl font-bold text-structure">
              Task Statistics
            </h2>
            <p className="text-sm text-text-secondary font-sans mt-1">
              Real-time task overview
            </p>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-3"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="bg-background rounded-sm p-4 border border-structure/10 text-center"
              >
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05
                  }}
                  className={`font-serif text-3xl font-bold ${stat.color}`}
                >
                  {stat.value}
                </motion.p>
                <p className="font-mono text-xs uppercase tracking-widest text-structure/60 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="bg-structure/5 p-4 rounded-sm text-center">
              <p className="font-mono text-sm text-structure/60">
                No tasks yet. Create some tasks to see statistics!
              </p>
            </div>
          )}

          {/* Live Update Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-structure/50">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span>Live updates enabled</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}