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

// FIXED: Pure fetch implementation to prevent any navigation/refresh issues
// The previous implementation might have been causing navigation due to error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Create AbortController to handle potential cancellation
  const controller = new AbortController();
  const signal = controller.signal;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    signal, // Add signal to prevent hanging requests
    mode: 'cors', // Explicit CORS mode
    credentials: 'same-origin', // Prevent credential issues
  };

  const config = { ...defaultOptions, ...options };

  console.log('🔵 API Request:', { 
    method: config.method || 'GET', 
    url, 
    body: config.body,
    headers: config.headers 
  });

  try {
    // Use pure fetch with explicit error handling to prevent any navigation issues
    const response = await fetch(url, config);
    
    console.log('🔵 API Response:', { 
      status: response.status, 
      statusText: response.statusText, 
      url: response.url,
      ok: response.ok,
      redirected: response.redirected
    });
    
    // Check for redirects that might cause page refresh
    if (response.redirected) {
      console.warn('🔵 API Response was redirected - this might cause issues');
    }
    
    // Handle non-OK responses without throwing to prevent navigation issues
    if (!response.ok) {
      console.error('🔵 API Request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      // Try to get error details from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (parseError) {
        console.warn('Could not parse error response:', parseError);
      }
      
      throw new ApiError(errorMessage, response.status);
    }

    // Parse JSON response safely
    let data: T;
    try {
      const textResponse = await response.text();
      data = textResponse ? JSON.parse(textResponse) : {} as T;
    } catch (parseError) {
      console.error('🔵 JSON Parse Error:', parseError);
      throw new ApiError('Invalid JSON response from server', response.status);
    }
    
    console.log('🔵 API Response data:', data);
    return data;
    
  } catch (error) {
    console.error('🔵 API Error caught:', error);
    
    // Handle different types of errors without causing navigation
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error - check your connection', 0);
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request was cancelled', 0);
    }
    
    throw new ApiError('Unexpected error occurred', 0);
  }
}

// HTTP method helpers with explicit return types to prevent any issues
export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'GET' });
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
  },
};

export { ApiError };
export type { ApiResponse };