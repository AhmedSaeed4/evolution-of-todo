import { useState, useCallback, useMemo } from 'react';
import { TaskFilters, Task } from '@/types';
import { parseSearchWithTags, taskMatchesTags } from '@/lib/tagSearch';

interface UseFiltersReturn {
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  filteredTasks: Task[];
  updateFilter: (key: keyof TaskFilters, value: string | undefined) => void;
  clearFilters: () => void;
}

export function useFilters(tasks: Task[]): UseFiltersReturn {
  const [filters, setFilters] = useState<TaskFilters>({});

  const updateFilter = useCallback((key: keyof TaskFilters, value: string | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === undefined || value === '') {
        delete newFilters[key];
      } else {
        newFilters[key] = value as any;
      }
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Apply search filter (text only, no tags - tags handled separately)
    const searchQuery = filters.search || '';
    const parsedSearch = parseSearchWithTags(searchQuery);

    if (parsedSearch.search) {
      const searchLower = parsedSearch.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply tag filter (from #tags in search query OR direct tags filter)
    const tagsToFilter = filters.tags?.length ? filters.tags : parsedSearch.tags;
    if (tagsToFilter && tagsToFilter.length > 0) {
      filtered = filtered.filter(task => taskMatchesTags(task, tagsToFilter));
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;

        switch (filters.sortBy) {
          case 'dueDate':
            aVal = a.dueDate || '';
            bVal = b.dueDate || '';
            break;
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            aVal = priorityOrder[a.priority];
            bVal = priorityOrder[b.priority];
            break;
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'createdAt':
            aVal = a.createdAt;
            bVal = b.createdAt;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, filters]);

  return {
    filters,
    setFilters,
    filteredTasks,
    updateFilter,
    clearFilters,
  };
}
