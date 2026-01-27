// Generic API client wrapper for backend integration
// Handles JWT token injection, error handling, and request/response logging

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };

  // Inject JWT token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${backendUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle different response statuses
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}` };
      }

      // Map HTTP status to meaningful errors
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else if (response.status === 404) {
        throw new Error('Resource not found.');
      } else if (response.status === 422) {
        throw new Error(`Validation error: ${errorData.detail || 'Invalid input data'}`);
      } else {
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Please check your connection and try again');
  }
}
