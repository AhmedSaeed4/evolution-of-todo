'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useFilters } from '@/hooks/useFilters';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '@/types';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFilters as TaskFiltersComponent } from '@/components/tasks/TaskFilters';
import { TaskSearch } from '@/components/tasks/TaskSearch';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { fadeInUp } from '@/motion/variants';
import { isAuthBypassEnabled } from '@/lib/auth';

export default function TasksPage() {
  const { user, isAuthenticated } = useAuth();
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { filters, setFilters, filteredTasks } = useFilters(tasks);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Redirect if not authenticated (only when bypass is disabled)
  useEffect(() => {
    if (!isAuthBypassEnabled() && !isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Skip auth check in bypass mode
  if (!isAuthBypassEnabled() && (!isAuthenticated || !user)) {
    return null;
  }

  const handleCreate = async (data: CreateTaskDTO) => {
    try {
      setIsCreating(true);
      await createTask(data);
      setIsCreateModalOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data: Task) => {
    await updateTask(data.id, data as UpdateTaskDTO);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    setTaskToDelete(id);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const handleToggle = async (id: string) => {
    await toggleTask(id);
  };

  const handleSearch = (query: string) => {
    setSearchLoading(true);
    setFilters({ ...filters, search: query });
    // Simulate loading for better UX
    setTimeout(() => setSearchLoading(false), 300);
  };

  const handleFilterChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2A1B12]">
            My Tasks
          </h1>
          <p className="text-[#5C4D45] font-sans text-sm mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + New Task
        </Button>
      </div>

      {/* Search */}
      <TaskSearch onSearch={handleSearch} isLoading={searchLoading} />

      {/* Filters */}
      <TaskFiltersComponent filters={filters} onChange={handleFilterChange} />

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FF6B4A]/10 border border-[#FF6B4A] p-4 rounded-sm"
        >
          <p className="text-[#FF6B4A] font-mono text-sm">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#FF6B4A] border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Task List */}
      {!loading && (
        <TaskList
          tasks={filteredTasks}
          onToggle={handleToggle}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onCreate={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          mode="create"
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-6">
          <p className="font-sans text-sm text-[#5C4D45]">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setTaskToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90"
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}