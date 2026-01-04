# Quickstart Guide: Todo Full-Stack Web Application Frontend

**Branch**: `003-frontend-design`
**Date**: 2025-12-29
**Constitution Version**: v1.1.0
**Estimated Setup Time**: 10 minutes

---

## Prerequisites

- **Node.js**: v18.18+ or v20.10+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

---

## Step 1: Initialize Next.js Project

Run the following command from the **root directory** of your project:

```bash
npx create-next-app@latest frontend \
  --yes \
  --no-react-compiler \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --no-import-alias
```

**What this does**:
- Creates `frontend/` directory
- Sets up Next.js 16+ with App Router
- Configures TypeScript and ESLint
- Installs Tailwind CSS
- Uses `src/` directory structure
- No import aliases (clean paths)

**Expected output**:
```
✓ Created Next.js app in 'frontend'
✓ Installing dependencies...
✓ Initializing Git repository...
```

---

## Step 2: Install Additional Dependencies

Navigate to the frontend directory and install required packages:

```bash
cd frontend
npm install framer-motion lucide-react better-auth
```

**Dependencies explained**:
- **framer-motion**: Animation library for smooth transitions
- **lucide-react**: Icon library (lightweight, modern)
- **better-auth**: Authentication with JWT support

---

## Step 3: Configure Fonts

### Option A: Google Fonts (Recommended)

Add to `src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Option B: @fontsource Packages

```bash
npm install @fontsource/playfair-display @fontsource/dm-sans @fontsource/jetbrains-mono
```

Then add to `src/app/globals.css`:

```css
@use '@fontsource/playfair-display';
@use '@fontsource/dm-sans';
@use '@fontsource/jetbrains-mono';
```

---

## Step 4: Configure Tailwind with Design Tokens

Replace `tailwind.config.ts` with:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9F7F2',  // Cream (Main BG)
        surface: '#F5F2E9',     // Slightly darker cream (Cards)
        structure: '#2A1B12',   // Technical lines/borders
        accent: '#FF6B4A',      // Vibrant orange (CTA/Active)
        'accent-hover': '#FF5733',
        'priority-high': '#FF6B4A',
        'priority-medium': '#F59E0B',
        'priority-low': '#10B981',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'editorial': '12px',
        'technical': '4px',
      },
      borderWidth: {
        'structure': '1px',
      },
      spacing: {
        'editorial': '2.5rem',
        'technical': '0.5rem',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
```

---

## Step 5: Create Project Structure

Create the following directory structure inside `src/`:

```bash
# From frontend/ directory
mkdir -p src/app/\(auth\)/{login,signup}
mkdir -p src/app/\(dashboard\)/{tasks,profile}
mkdir -p src/components/{ui,layout,tasks,auth}
mkdir -p src/lib src/hooks src/types src/motion
```

**Result**:
```
frontend/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── tasks/
│   └── auth/
├── lib/
├── hooks/
├── types/
└── motion/
```

---

## Step 6: Create Type Definitions

Create `src/types/index.ts`:

```typescript
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
```

---

## Step 7: Create Motion Variants

Create `src/motion/variants.ts`:

```typescript
import { Variants } from 'framer-motion';

// Fade In Up Animation
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Stagger Container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Scale Animation (for checkboxes)
export const scaleIn: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Fade Out
export const fadeOut: Variants = {
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};
```

---

## Step 8: Create Mock API Service

Create `src/lib/api.ts`:

```typescript
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
```

---

## Step 9: Create Basic Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Modern todo application with task management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

---

## Step 10: Create Landing Page

Update `src/app/page.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/motion/variants';

export default function Home() {
  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
    >
      <motion.div variants={fadeInUp} className="text-center max-w-2xl">
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-structure mb-6">
          Todo.
        </h1>
        <p className="font-sans text-xl text-structure/70 mb-12">
          Modern task management with beautiful design and smooth animations.
        </p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/login"
            className="px-8 py-3 bg-accent text-white font-sans font-medium rounded-editorial hover:bg-accent-hover transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 border-structure border-structure font-sans font-medium rounded-editorial hover:bg-surface transition-colors"
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
```

---

## Step 11: Run Development Server

```bash
npm run dev
```

**Expected output**:
```
✓ Ready in 2.3s
✓ Local: http://localhost:3000
```

---

## Step 12: Verify Installation

Open your browser to `http://localhost:3000`

**You should see**:
- Cream background (#F9F7F2)
- Large serif "Todo." heading
- Two buttons: "Login" and "Get Started"
- Smooth fade-in animation on page load

---

## Next Steps

After successful setup, you can:

1. **Build Authentication**: Create login/signup forms
2. **Create UI Components**: Button, Input, Card, Badge, etc.
3. **Build Task Features**: TaskCard, TaskForm, TaskList
4. **Add Search & Filters**: TaskSearch, TaskFilters components
5. **Implement Protected Routes**: Wrap dashboard with auth check

---

## Troubleshooting

### Issue: "Module not found"
**Solution**: Ensure you're in the `frontend/` directory and dependencies are installed

### Issue: "Font import error"
**Solution**: Verify font URLs in globals.css or reinstall @fontsource packages

### Issue: "Tailwind classes not working"
**Solution**: Restart dev server: `npm run dev -- --clear`

### Issue: "TypeScript errors"
**Solution**: Run `npx tsc --noEmit` to check types, ensure types/index.ts exists

---

## Environment Variables (Optional)

Create `.env.local` in `frontend/` directory:

```env
# Authentication
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# API (for future backend integration)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Better Auth configuration
BETTER_AUTH_SECRET=your-secret-key-here
```

---

**Quickstart Status**: ✅ Complete
**Ready for Development**: ✅ Yes
**Estimated Time to Build**: 2-3 hours for full implementation