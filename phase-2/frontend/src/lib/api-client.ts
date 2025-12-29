// Generic API client wrapper for future backend integration
// Currently used for structure, will be activated when backend is ready

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // TODO: Implement JWT token injection from Better Auth session
  // TODO: Replace mock API calls with this client

  // For now, this is a placeholder for the future implementation
  // When backend is ready, this will handle:
  // - JWT token injection
  // - Request/response logging
  // - Error handling
  // - Retry logic

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };

  // Future implementation:
  // const session = await getSession();
  // const token = session?.token;
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }

  // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
  //   ...options,
  //   headers
  // });

  // if (!response.ok) {
  //   const error = await response.json().catch(() => ({ message: 'Unknown error' }));
  //   throw new Error(error.message || `HTTP ${response.status}`);
  // }

  // return response.json() as Promise<T>;

  throw new Error('API client not yet implemented - using mock services in api.ts');
}
