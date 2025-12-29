import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters, User } from '@/types';

// Mock Data Store
let mockTasks: Task[] = [];
let mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date().toISOString()
  }
];

// Generate UUID (for mock purposes)
function generateUUID(): string {
  return crypto.randomUUID();
}

// API Methods
export const api = {
  // GET all tasks
  async getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: GET /api/{user_id}/tasks
    return mockTasks
      .filter(task => task.userId === userId)
      .filter(task => !filters?.status || task.status === filters.status)
      .filter(task => !filters?.priority || task.priority === filters.priority)
      .filter(task => !filters?.category || task.category === filters.category)
      .filter(task => {
        if (!filters?.search) return true;
        const search = filters.search.toLowerCase();
        return task.title.toLowerCase().includes(search) ||
          (task.description?.toLowerCase().includes(search) || false);
      })
      .sort((a, b) => {
        if (!filters?.sortBy) return 0;
        const field = filters.sortBy;
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        let aVal = a[field as keyof Task];
        let bVal = b[field as keyof Task];

        if (field === 'dueDate' || field === 'createdAt') {
          return (new Date(aVal as string).getTime() - new Date(bVal as string).getTime()) * order;
        }

        if (field === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
        }

        return String(aVal).localeCompare(String(bVal)) * order;
      });
  },

  // CREATE task
  async create(userId: string, data: CreateTaskDTO): Promise<Task> {
    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: POST /api/{user_id}/tasks
    const newTask: Task = {
      id: generateUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      status: 'pending',
      completed: false,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId
    };
    mockTasks.push(newTask);
    return newTask;
  },

  // UPDATE task
  async update(userId: string, taskId: string, data: UpdateTaskDTO): Promise<Task> {
    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: PUT /api/{user_id}/tasks/{task_id}
    const taskIndex = mockTasks.findIndex(t => t.id === taskId && t.userId === userId);

    if (taskIndex === -1) {
      throw new Error('Task not found or access denied');
    }

    const updatedTask = {
      ...mockTasks[taskIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  },

  // DELETE task
  async delete(userId: string, taskId: string): Promise<void> {
    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: DELETE /api/{user_id}/tasks/{task_id}
    const taskIndex = mockTasks.findIndex(t => t.id === taskId && t.userId === userId);

    if (taskIndex === -1) {
      throw new Error('Task not found or access denied');
    }

    mockTasks.splice(taskIndex, 1);
  },

  // TOGGLE COMPLETE
  async toggleComplete(userId: string, taskId: string): Promise<Task> {
    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: PATCH /api/{user_id}/tasks/{task_id}/complete
    const taskIndex = mockTasks.findIndex(t => t.id === taskId && t.userId === userId);

    if (taskIndex === -1) {
      throw new Error('Task not found or access denied');
    }

    const task = mockTasks[taskIndex];
    task.completed = !task.completed;
    task.status = task.completed ? 'completed' : 'pending';
    task.updatedAt = new Date().toISOString();

    return task;
  },

  // UPDATE PROFILE
  async updateProfile(userId: string, data: { name: string }): Promise<User> {
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate occasional network failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error: Please check your connection and try again');
    }

    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: PUT /api/{user_id}/profile
    const userIndex = mockUsers.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found or session expired');
    }

    const updatedUser = {
      ...mockUsers[userIndex],
      name: data.name,
      // Preserve email and createdAt
      email: mockUsers[userIndex].email,
      createdAt: mockUsers[userIndex].createdAt
    };

    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  },

  // CHANGE PASSWORD
  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }): Promise<void> {
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 400));

    // Simulate occasional network failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error: Please check your connection and try again');
    }

    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: POST /api/{user_id}/change-password
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found or session expired');
    }

    // Mock password validation (always succeeds in mock mode)
    // In real implementation: verify currentPassword matches stored hash
    if (data.currentPassword === data.newPassword) {
      throw new Error('New password must be different from current password');
    }

    if (data.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    // Mock success - no actual password change in mock mode
    return Promise.resolve();
  },

  // GET TASK STATISTICS
  async getTaskStats(userId: string): Promise<{ total: number; pending: number; completed: number }> {
    // Simulate minimal network delay for stats
    await new Promise(resolve => setTimeout(resolve, 100));

    // TODO: Replace with fetch() to FastAPI endpoint
    // TODO: GET /api/{user_id}/stats
    const userTasks = mockTasks.filter(t => t.userId === userId);

    return {
      total: userTasks.length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      completed: userTasks.filter(t => t.status === 'completed').length
    };
  }
};
