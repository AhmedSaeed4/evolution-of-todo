import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters, User } from '@/types';
import { apiClient } from './api-client';
import { getAuthToken, getCurrentUserId, isAuthBypassEnabled } from './auth';

// API Methods - Now using real backend
export const api = {
  // GET all tasks
  async getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Authentication required');

    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sort_by', filters.sortBy);
    if (filters?.sortOrder) params.append('sort_order', filters.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<Task[]>(`/api/${userId}/tasks${queryString}`, {}, token);
  },

  // CREATE task
  async create(userId: string, data: CreateTaskDTO): Promise<Task> {
    const token = await getAuthToken();
    if (!token) throw new Error('Authentication required');

    return apiClient<Task>(
      `/api/${userId}/tasks`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      token
    );
  },

  // UPDATE task
  async update(userId: string, taskId: string, data: UpdateTaskDTO): Promise<Task> {
    const token = await getAuthToken();
    if (!token) throw new Error('Authentication required');

    return apiClient<Task>(
      `/api/${userId}/tasks/${taskId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data)
      },
      token
    );
  },

  // DELETE task
  async delete(userId: string, taskId: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error('Authentication required');

    return apiClient<void>(
      `/api/${userId}/tasks/${taskId}`,
      {
        method: 'DELETE'
      },
      token
    );
  },

  // TOGGLE COMPLETE
  async toggleComplete(userId: string, taskId: string): Promise<Task> {
    const token = await getAuthToken();
    if (!token) throw new Error('Authentication required');

    return apiClient<Task>(
      `/api/${userId}/tasks/${taskId}/complete`,
      {
        method: 'PATCH'
      },
      token
    );
  },

  // UPDATE PROFILE
  async updateProfile(userId: string, data: { name: string }): Promise<User> {
    // Note: This endpoint is not implemented in the backend yet
    // Keeping mock behavior for now
    await new Promise(resolve => setTimeout(resolve, 300));

    if (Math.random() < 0.05) {
      throw new Error('Network error: Please check your connection and try again');
    }

    // For now, return mock user since profile endpoint isn't in backend spec
    return {
      id: userId,
      email: 'demo@example.com',
      name: data.name,
      createdAt: new Date().toISOString()
    };
  },

  // CHANGE PASSWORD
  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }): Promise<void> {
    // Note: This endpoint is not implemented in the backend yet
    // Keeping mock behavior for now
    await new Promise(resolve => setTimeout(resolve, 400));

    if (Math.random() < 0.05) {
      throw new Error('Network error: Please check your connection and try again');
    }

    if (data.currentPassword === data.newPassword) {
      throw new Error('New password must be different from current password');
    }

    if (data.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    return Promise.resolve();
  },

  // GET TASK STATISTICS
  async getTaskStats(userId: string): Promise<{ total: number; pending: number; completed: number }> {
    const token = await getAuthToken();
    if (!token) throw new Error('Authentication required');

    return apiClient<{ total: number; pending: number; completed: number }>(
      `/api/${userId}/stats`,
      {},
      token
    );
  }
};
