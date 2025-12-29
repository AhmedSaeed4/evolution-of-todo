import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters, User } from '@/types';

// Mock Data Store
let mockTasks: Task[] = [];
let mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'demo@example.com',
    name: 'Demo User'
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
  }
};
