import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Task, TaskFilters, CreateTaskDTO, UpdateTaskDTO } from '@/types';
import { useAuth } from './useAuth';
import { isAuthBypassEnabled } from '@/lib/auth';

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
      const tasks = await api.getAll(effectiveUserId, filters || state.filters);
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
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      const newTask = await api.create(effectiveUserId, data);
      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
      return { success: true, task: newTask };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateTask = async (taskId: string, data: UpdateTaskDTO): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      const updatedTask = await api.update(effectiveUserId, taskId, data);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
      return { success: true, task: updatedTask };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteTask = async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      await api.delete(effectiveUserId, taskId);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const toggleTask = async (taskId: string): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (!effectiveUserId) return { success: false, error: 'Not authenticated' };

    try {
      const updatedTask = await api.toggleComplete(effectiveUserId, taskId);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
      return { success: true, task: updatedTask };
    } catch (error) {
      return { success: false, error: (error as Error).message };
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
