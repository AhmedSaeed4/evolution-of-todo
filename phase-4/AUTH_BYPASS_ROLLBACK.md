# Authentication Bypass Rollback Reference

This file contains the **exact original code** for all 7 modified files. Use this to completely remove the authentication bypass functionality and restore the original codebase.

## Files Modified (7 total)

1. `.env.local.example`
2. `src/lib/auth.ts`
3. `src/hooks/useAuth.ts`
4. `src/components/auth/ProtectedRoute.tsx`
5. `src/hooks/useTasks.ts`
6. `src/app/(dashboard)/tasks/page.tsx`
7. `src/components/layout/Navbar.tsx`

---

## 1. `.env.local.example`

### Original Content
```bash
# Frontend Environment Variables

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Better Auth Secret (Generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here

# Optional: Production URLs
# NEXT_PUBLIC_API_URL=https://api.yourapp.com
# NEXT_PUBLIC_AUTH_URL=https://yourapp.com

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
# NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### Current Modified Content
```bash
# Frontend Environment Variables

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Better Auth Secret (Generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here

# Authentication Bypass - Set to "true" to disable auth requirements for testing
# When true: All routes are accessible, mock user is used, no login required
# When false: Normal authentication flow is enforced
NEXT_PUBLIC_AUTH_BYPASS=false

# Optional: Production URLs
# NEXT_PUBLIC_API_URL=https://api.yourapp.com
# NEXT_PUBLIC_AUTH_URL=https://yourapp.com

# Optional: Feature Flags
# NEXT_PUBLIC_ENABLE_ANALYTICS=false
# NEXT_PUBLIC_MAINTENANCE_MODE=false
```

---

## 2. `src/lib/auth.ts`

### Original Content
```typescript
// Better Auth configuration for Next.js 16+ App Router
// This file sets up the authentication client with JWT support

import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

// Auth client instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  plugins: [jwtClient()]
});

// Export auth methods
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const getSession = authClient.getSession;

// Helper function to check authentication status
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

// Helper to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  const sessionResult = await getSession();
  const session: any = sessionResult?.data || sessionResult;
  return session?.user?.id || null;
}
```

### Current Modified Content
```typescript
// Better Auth configuration for Next.js 16+ App Router
// This file sets up the authentication client with JWT support

import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';

// Mock user for bypass mode
const MOCK_USER = {
  id: 'bypass-user',
  email: 'bypass@example.com',
  name: 'Bypass User'
};

// Auth client instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000',
  plugins: [jwtClient()]
});

// Export auth methods
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const getSession = authClient.getSession;

// Helper function to check if auth bypass is enabled
export function isAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true';
}

// Helper function to check authentication status
export async function requireAuth() {
  // If bypass is enabled, always return success
  if (isAuthBypassEnabled()) {
    return { user: MOCK_USER };
  }

  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

// Helper to get current user ID
export async function getCurrentUserId(): Promise<string | null> {
  // If bypass is enabled, return mock user ID
  if (isAuthBypassEnabled()) {
    return MOCK_USER.id;
  }

  const sessionResult = await getSession();
  const session: any = sessionResult?.data || sessionResult;
  return session?.user?.id || null;
}

// Helper to get current user (for bypass mode)
export async function getCurrentUser(): Promise<any> {
  if (isAuthBypassEnabled()) {
    return MOCK_USER;
  }

  const sessionResult = await getSession();
  const session: any = sessionResult?.data || sessionResult;
  return session?.user || null;
}

// Helper to check if user is authenticated (for bypass mode)
export async function isAuthenticated(): Promise<boolean> {
  if (isAuthBypassEnabled()) {
    return true;
  }

  const session = await getSession();
  return !!session;
}
```

---

## 3. `src/hooks/useAuth.ts`

### Original Content
```typescript
import { useState, useEffect } from 'react';
import { authClient, getSession } from '@/lib/auth';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionResult = await getSession();
      // Handle Better Auth response type - check for data property or direct access
      const session: any = sessionResult?.data || sessionResult;

      // Type guard to check if session has user
      const hasUser = session && typeof session === 'object' && 'user' in session &&
                      session.user && typeof session.user === 'object';

      if (hasUser) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name || 'User',
          },
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: 'Failed to check authentication',
        isAuthenticated: false,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refetch: checkAuth,
  };
}
```

### Current Modified Content
```typescript
import { useState, useEffect } from 'react';
import { authClient, getSession, isAuthBypassEnabled, getCurrentUser } from '@/lib/auth';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if auth bypass is enabled
      if (isAuthBypassEnabled()) {
        const mockUser = await getCurrentUser();
        setState({
          user: mockUser ? {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
          } : null,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        return;
      }

      const sessionResult = await getSession();
      // Handle Better Auth response type - check for data property or direct access
      const session: any = sessionResult?.data || sessionResult;

      // Type guard to check if session has user
      const hasUser = session && typeof session === 'object' && 'user' in session &&
                      session.user && typeof session.user === 'object';

      if (hasUser) {
        setState({
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name || 'User',
          },
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: 'Failed to check authentication',
        isAuthenticated: false,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    // If bypass is enabled, auto-authenticate with mock user
    if (isAuthBypassEnabled()) {
      await checkAuth();
      return { success: true };
    }

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    // If bypass is enabled, auto-authenticate with mock user
    if (isAuthBypassEnabled()) {
      await checkAuth();
      return { success: true };
    }

    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) {
        throw new Error(result.error.message);
      }
      await checkAuth();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const signOut = async () => {
    // If bypass is enabled, just reset state (no actual logout)
    if (isAuthBypassEnabled()) {
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      return { success: true };
    }

    try {
      await authClient.signOut();
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    refetch: checkAuth,
  };
}
```

---

## 4. `src/components/auth/ProtectedRoute.tsx`

### Original Content
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#F9F7F2] flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### Current Modified Content
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { isAuthBypassEnabled } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // If bypass is enabled, never redirect
    if (isAuthBypassEnabled()) {
      return;
    }

    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // If bypass is enabled, skip loading state and render immediately
  if (isAuthBypassEnabled()) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#F9F7F2] flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 5. `src/hooks/useTasks.ts`

### Original Content
```typescript
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Task, TaskFilters, CreateTaskDTO, UpdateTaskDTO } from '@/types';
import { useAuth } from './useAuth';

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

  const fetchTasks = useCallback(async (filters?: TaskFilters) => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const tasks = await api.getAll(user.id, filters || state.filters);
      setState(prev => ({ ...prev, tasks, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: (error as Error).message
      }));
    }
  }, [user?.id, state.filters]);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id, fetchTasks]);

  const createTask = async (data: CreateTaskDTO): Promise<{ success: boolean; task?: Task; error?: string }> => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    try {
      const newTask = await api.create(user.id, data);
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
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    try {
      const updatedTask = await api.update(user.id, taskId, data);
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
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    try {
      await api.delete(user.id, taskId);
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
    if (!user?.id) return { success: false, error: 'Not authenticated' };

    try {
      const updatedTask = await api.toggleComplete(user.id, taskId);
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
    if (user?.id) {
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
```

### Current Modified Content
```typescript
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
```

---

## 6. `src/app/(dashboard)/tasks/page.tsx`

### Original Content
```typescript
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

export default function TasksPage() {
  const { user, isAuthenticated } = useAuth();
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { filters, setFilters, filteredTasks } = useFilters(tasks);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleCreate = async (data: CreateTaskDTO) => {
    await createTask(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: Task) => {
    await updateTask(data.id, data as UpdateTaskDTO);
    setEditingTask(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
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
    </motion.div>
  );
}
```

### Current Modified Content
```typescript
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
  const [searchLoading, setSearchLoading] = useState(false);

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
    await createTask(data);
    setIsCreateModalOpen(false);
  };

  const handleUpdate = async (data: Task) => {
    await updateTask(data.id, data as UpdateTaskDTO);
    setEditingTask(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
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
    </motion.div>
  );
}
```

---

## 7. `src/components/layout/Navbar.tsx`

### Original Content
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User, ListTodo } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-[#F9F7F2]/95 backdrop-blur-sm border-b border-[#2A1B12]/10"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/tasks"
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="font-serif text-2xl font-bold text-[#2A1B12]"
            >
              Todo.
            </motion.div>
            <ListTodo className="w-5 h-5 text-[#FF6B4A] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/tasks"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                pathname === '/tasks' ? 'text-[#FF6B4A]' : 'text-[#2A1B12] hover:text-[#FF6B4A]'
              }`}
            >
              Tasks
            </Link>
            <Link
              href="/profile"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                pathname === '/profile' ? 'text-[#FF6B4A]' : 'text-[#2A1B12] hover:text-[#FF6B4A]'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-xs font-mono opacity-70">
                <User className="w-3 h-3" />
                <span>{user.name}</span>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-3 h-3 mr-1" />
              {isSigningOut ? 'Signing Out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
```

### Current Modified Content
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, User, ListTodo } from 'lucide-react';
import { isAuthBypassEnabled } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    // In bypass mode, redirect back to tasks instead of login
    if (isAuthBypassEnabled()) {
      router.push('/tasks');
    } else {
      router.push('/login');
    }
  };

  // In bypass mode, always show navbar
  if (!isAuthBypassEnabled() && !isAuthenticated) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bg-[#F9F7F2]/95 backdrop-blur-sm border-b border-[#2A1B12]/10"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/tasks"
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="font-serif text-2xl font-bold text-[#2A1B12]"
            >
              Todo.
            </motion.div>
            <ListTodo className="w-5 h-5 text-[#FF6B4A] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/tasks"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                pathname === '/tasks' ? 'text-[#FF6B4A]' : 'text-[#2A1B12] hover:text-[#FF6B4A]'
              }`}
            >
              Tasks
            </Link>
            <Link
              href="/profile"
              className={`font-mono text-xs uppercase tracking-widest transition-colors ${
                pathname === '/profile' ? 'text-[#FF6B4A]' : 'text-[#2A1B12] hover:text-[#FF6B4A]'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-xs font-mono opacity-70">
                <User className="w-3 h-3" />
                <span>{user.name}</span>
                {isAuthBypassEnabled() && (
                  <span className="text-[#FF6B4A] ml-1">(Bypass)</span>
                )}
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-3 h-3 mr-1" />
              {isSigningOut ? 'Signing Out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
```

---

## Quick Rollback Steps

### Option 1: Manual File Replacement
1. Copy each "Original Content" section above
2. Replace the corresponding file content
3. Remove `.env.local` if it contains `NEXT_PUBLIC_AUTH_BYPASS`

### Option 2: Git Revert (Recommended)
```bash
# If you haven't committed the changes yet:
git checkout -- phase-2/frontend/.env.local.example
git checkout -- phase-2/frontend/src/lib/auth.ts
git checkout -- phase-2/frontend/src/hooks/useAuth.ts
git checkout -- phase-2/frontend/src/components/auth/ProtectedRoute.tsx
git checkout -- phase-2/frontend/src/hooks/useTasks.ts
git checkout -- phase-2/frontend/src/app/(dashboard)/tasks/page.tsx
git checkout -- phase-2/frontend/src/components/layout/Navbar.tsx

# Remove any .env.local file
rm phase-2/frontend/.env.local
```

### Option 3: Git Reset (If changes are committed)
```bash
# Find the commit hash before auth bypass changes
git log --oneline

# Reset to that commit
git reset --hard <commit-hash>
```

---

## Verification Checklist

After rollback, verify:

- [ ] Original auth flow works (redirect to login)
- [ ] Login/signup forms function normally
- [ ] Protected routes require authentication
- [ ] No bypass-related imports remain
- [ ] No bypass-related environment variables
- [ ] All original functionality restored

---

**Document Created**: 2025-12-29
**Purpose**: Complete rollback reference for auth bypass implementation
**Files Covered**: 7 modified files with before/after content