// Base API configuration and utilities
// Use Vite proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8000');

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log('🔵 API Request:', { method: config.method || 'GET', url, body: config.body });
    
    const response = await fetch(url, config);
    
    console.log('🔵 API Response:', { 
      status: response.status, 
      statusText: response.statusText, 
      url: response.url 
    });
    
    if (!response.ok) {
      console.error('🔵 API Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    console.log('🔵 API Response data:', data);
    return data;
  } catch (error) {
    console.error('🔵 API Error caught:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable', 0);
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: any): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: any): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
export type { ApiResponse };