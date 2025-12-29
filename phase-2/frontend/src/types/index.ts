// Priority Levels
export type Priority = 'low' | 'medium' | 'high';

// Categories
export type Category = 'work' | 'personal' | 'home' | 'other';

// Task Status
export type TaskStatus = 'pending' | 'completed';

// Core Task Interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  status: TaskStatus;
  completed: boolean;
  dueDate?: string;      // ISO 8601
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
  userId: string;
}

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;  // ISO 8601 timestamp for member since display
}

// Task Filters
export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  category?: Category;
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Data Transfer Objects
export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: Priority;
  category: Category;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
}
