// Priority Levels
export type Priority = 'low' | 'medium' | 'high';

// Categories
export type Category = 'work' | 'personal' | 'home' | 'other';

// Task Status
export type TaskStatus = 'pending' | 'completed';

// NEW: Recurring Rule
export type RecurringRule = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  // NEW: Recurring task fields
  recurringRule?: RecurringRule;
  recurringEndDate?: string;  // ISO 8601
  parentTaskId?: string;
  // NEW: Reminder fields
  reminderAt?: string;   // ISO 8601
  reminderSent: boolean;
  // NEW: Tags field
  tags?: string[];
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
  tags?: string[];  // NEW: Tag filter (e.g., ["work", "urgent"])
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
  // NEW: Recurring task fields
  recurringRule?: RecurringRule;
  recurringEndDate?: string;
  // NEW: Reminder field
  reminderAt?: string;
  // NEW: Tags field
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  category?: Category;
  dueDate?: string;
  // NEW: Recurring task fields
  recurringRule?: RecurringRule;
  recurringEndDate?: string;
  // NEW: Reminder field
  reminderAt?: string;
  // NEW: Tags field
  tags?: string[];
}

// NEW: Notification Interface
export interface Notification {
  id: string;
  userId: string;
  message: string;
  taskId?: string;
  read: boolean;
  createdAt: string;  // ISO 8601
}

// NEW: Audit Log Entry Interface
export interface AuditLogEntry {
  id: string;
  eventType: 'created' | 'updated' | 'deleted' | 'completed';
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;  // ISO 8601
  data: Record<string, unknown>;
}
