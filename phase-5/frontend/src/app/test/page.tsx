'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskSearch } from '@/components/tasks/TaskSearch';
import { TaskList } from '@/components/tasks/TaskList';
import { fadeInUp, staggerContainer } from '@/motion/variants';
import { Task, CreateTaskDTO } from '@/types';

// Mock task data for testing
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design Homepage',
    description: 'Create wireframes and mockups for the new homepage',
    priority: 'high',
    category: 'work',
    status: 'pending',
    completed: false,
    dueDate: '2025-01-15',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
    userId: 'test-user',
    reminderSent: false
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, coffee',
    priority: 'low',
    category: 'home',
    status: 'completed',
    completed: true,
    dueDate: '2025-01-10',
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
    userId: 'test-user',
    reminderSent: false
  },
  {
    id: '3',
    title: 'Read 30 pages',
    description: 'Continue reading the design book',
    priority: 'medium',
    category: 'personal',
    status: 'pending',
    completed: false,
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
    userId: 'test-user',
    reminderSent: false
  }
];

export default function TestPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({});

  const handleCreate = async (data: CreateTaskDTO) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      status: 'pending',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'test-user',
      reminderSent: false
    };
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: Task) => {
    setTasks(tasks.map(t => t.id === data.id ? data : t));
    setEditingTask(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleToggle = async (id: string) => {
    setTasks(tasks.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed, status: t.completed ? 'pending' : 'completed' }
        : t
    ));
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] p-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center space-y-4">
          <h1 className="font-serif text-5xl font-bold text-[#2A1B12]">Design System Test</h1>
          <p className="text-[#5C4D45]">Test all UI components without authentication</p>
        </motion.div>

        {/* Component Showcase */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#2A1B12]">UI Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Buttons */}
            <Card>
              <h3 className="font-mono text-xs uppercase mb-3 opacity-60">Buttons</h3>
              <div className="space-y-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="technical">Technical</Button>
              </div>
            </Card>

            {/* Badges */}
            <Card>
              <h3 className="font-mono text-xs uppercase mb-3 opacity-60">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="high">High</Badge>
                <Badge variant="medium">Medium</Badge>
                <Badge variant="low">Low</Badge>
                <Badge variant="work">Work</Badge>
                <Badge variant="personal">Personal</Badge>
              </div>
            </Card>

            {/* Inputs */}
            <Card>
              <h3 className="font-mono text-xs uppercase mb-3 opacity-60">Inputs</h3>
              <Input label="Test Input" placeholder="Type something..." />
            </Card>

            {/* Checkbox */}
            <Card>
              <h3 className="font-mono text-xs uppercase mb-3 opacity-60">Checkbox</h3>
              <div className="space-y-2">
                <Checkbox checked={true} onChange={() => {}} label="Checked" />
                <Checkbox checked={false} onChange={() => {}} label="Unchecked" />
              </div>
            </Card>

            {/* Select */}
            <Card>
              <h3 className="font-mono text-xs uppercase mb-3 opacity-60">Select</h3>
              <Select
                label="Priority"
                value="high"
                onChange={() => {}}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
              />
            </Card>

            {/* Modal Trigger */}
            <Card>
              <h3 className="font-mono text-xs uppercase mb-3 opacity-60">Modal</h3>
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            </Card>
          </div>
        </motion.div>

        {/* Task Components */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#2A1B12]">Task Components</h2>

          {/* Search & Filters */}
          <div className="space-y-4">
            <TaskSearch onSearch={(q) => console.log('Search:', q)} />
            <TaskFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={setEditingTask}
                onDelete={handleDelete}
                index={index}
              />
            ))}
          </div>

          {/* Task List */}
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onCreate={() => setIsModalOpen(true)}
          />
        </motion.div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Task (Test Mode)"
        >
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setIsModalOpen(false)}
            mode="create"
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          title="Edit Task (Test Mode)"
        >
          {editingTask && (
            <TaskForm
              task={editingTask}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTask(null)}
              mode="edit"
            />
          )}
        </Modal>

        {/* Design Tokens */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#2A1B12]">Design Tokens</h2>
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-mono text-xs opacity-60 mb-1">Background</div>
                <div className="w-full h-8 bg-[#F9F7F2] border border-[#2A1B12]/20 rounded-sm"></div>
              </div>
              <div>
                <div className="font-mono text-xs opacity-60 mb-1">Surface</div>
                <div className="w-full h-8 bg-[#F5F2E9] border border-[#2A1B12]/20 rounded-sm"></div>
              </div>
              <div>
                <div className="font-mono text-xs opacity-60 mb-1">Structure</div>
                <div className="w-full h-8 bg-[#2A1B12] rounded-sm"></div>
              </div>
              <div>
                <div className="font-mono text-xs opacity-60 mb-1">Accent</div>
                <div className="w-full h-8 bg-[#FF6B4A] rounded-sm"></div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Typography */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#2A1B12]">Typography</h2>
          <Card className="space-y-4">
            <div>
              <div className="font-mono text-xs opacity-60 mb-1">Serif (Playfair Display)</div>
              <h1 className="font-serif text-4xl font-bold text-[#2A1B12]">The Quick Brown Fox</h1>
            </div>
            <div>
              <div className="font-mono text-xs opacity-60 mb-1">Sans (DM Sans)</div>
              <p className="font-sans text-lg text-[#2A1B12]">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div>
              <div className="font-mono text-xs opacity-60 mb-1">Mono (JetBrains Mono)</div>
              <p className="font-mono text-sm text-[#2A1B12]">const design = "Modern Technical Editorial";</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center pt-8 pb-4">
          <p className="text-sm text-[#5C4D45] font-mono">
            ✅ All components rendered successfully - Design system is working!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}