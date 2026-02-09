import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Task, TaskFilters, CreateTaskDTO, UpdateTaskDTO } from '@/types';
import { useAuth } from './useAuth';
import { isAuthBypassEnabled } from '@/lib/auth';
import { toast } from 'sonner';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export function useTasks(): TaskState & {
  createTask: (data: CreateTaskDTO) => Promise<{ success: boolean; task?: Task; error?: string }>;
  updateTask: (taskId: string, data: UpdateTaskDTO) => Promise<{ success: boolean; task?: Task; error?: string }>;
  deleteTask: (taskId: string) => Promise<{ success: boolean; error?: string }>;
  toggleTask: (taskId: string) => Promise<{ success: boolean; task?: Task; error?: string }>;
  setFilters: (filters: TaskFilters) => void;
  refetch: () => void;
} {
  const { user } = useAuth();
  const [state, setState] = useState<TaskState>({
    tasks: [],
    loading: false,
    error: null,
    filters: {},
  });

  // In bypass mode, use consistent mock user ID
  const effectiveUserId = isAuthBypassEnabled() ? 'bypass-user' : user?.id;

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    if (!effectiveUserId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const tasks = await api.getAll(filters || state.filters);
      setState(prev => ({ ...prev, tasks, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message
      }));
    }
  }, [effectiveUserId, state.filters]);

  useEffect(() => {
    if (effectiveUserId) {
      fetchTasks();
    }
  }, [effectiveUserId, fetchTasks]);

  const createTask = async (data: CreateTaskDTO): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (!effectiveUserId) {
      toast.error('Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const newTask = await api.create(data);
      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
      toast.success('Task created');
      return { success: true, task: newTask };
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateTask = async (taskId: string, data: UpdateTaskDTO): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (!effectiveUserId) {
      toast.error('Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedTask = await api.update(taskId, data);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
      toast.success('Task updated');
      return { success: true, task: updatedTask };
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    if (!effectiveUserId) {
      toast.error('Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await api.delete(taskId);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
      toast.success('Task deleted');
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const toggleTask = async (taskId: string): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (!effectiveUserId) {
      toast.error('Not authenticated');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedTask = await api.toggleComplete(taskId);

      // If this was a recurring task completion, refetch to get the new instance
      if (updatedTask.completed && updatedTask.recurringRule) {
        await fetchTasks();
        toast.success('Task completed - next instance created');
      } else {
        // Just update the existing task in state
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
        }));
        if (updatedTask.completed) {
          toast.success('Task completed');
        } else {
          toast.success('Task reopened');
        }
      }
      return { success: true, task: updatedTask };
    } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const setFilters = (filters: TaskFilters) => {
    setState(prev => ({ ...prev, filters }));
    if (effectiveUserId) {
      fetchTasks(filters);
    }
  };

  return {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    setFilters,
    refetch: () => fetchTasks(),
  };
}
