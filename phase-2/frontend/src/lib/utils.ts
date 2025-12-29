/**
 * Utility functions for the Todo application
 */

/**
 * Debounce function for limiting API calls and search operations
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
) {
  let timeout: NodeJS.Timeout | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };

  (debouncedFn as any).cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFn as (...args: Parameters<T>) => void & { cancel: () => void };
}

/**
 * Generate UUID v4 (for mock purposes)
 * In production, use crypto.randomUUID() or backend-generated IDs
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get time ago string (e.g., "2 hours ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
}

/**
 * Priority order for sorting
 */
export const priorityOrder: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get color for priority
 */
export function getPriorityColor(priority: string): string {
  const colors = {
    high: '#FF6B4A',
    medium: '#F59E0B',
    low: '#10B981',
  };
  return colors[priority as keyof typeof colors] || '#6B7280';
}

/**
 * Get color for category
 */
export function getCategoryColor(category: string): string {
  const colors = {
    work: '#3B82F6',
    personal: '#8B5CF6',
    home: '#10B981',
    other: '#6B7280',
  };
  return colors[category as keyof typeof colors] || '#6B7280';
}

/**
 * Tailwind classnames utility
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Validate profile form data
 * @param name - User's display name
 * @param email - User's email address
 * @returns Validation result with errors array
 */
export function validateProfileForm(name: string, email: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation
  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.push('Name is required');
  } else if (trimmedName.length < 1) {
    errors.push('Name must be at least 1 character');
  } else if (trimmedName.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  // Email validation
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.push('Email is required');
  } else if (!isValidEmail(trimmedEmail)) {
    errors.push('Invalid email format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate password change form data
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param confirmPassword - Confirmation of new password
 * @returns Validation result with errors array
 */
export function validatePasswordForm(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Current password validation
  if (!currentPassword.trim()) {
    errors.push('Current password is required');
  } else if (currentPassword.length < 8) {
    errors.push('Current password must be at least 8 characters');
  }

  // New password validation
  if (!newPassword.trim()) {
    errors.push('New password is required');
  } else if (newPassword.length < 8) {
    errors.push('New password must be at least 8 characters');
  }

  // Confirm password validation
  if (!confirmPassword.trim()) {
    errors.push('Please confirm your new password');
  } else if (newPassword !== confirmPassword) {
    errors.push('New passwords do not match');
  }

  // Check if new password is different from current
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format date to "Month DD, YYYY" format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "December 30, 2025")
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
