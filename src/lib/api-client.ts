import React from 'react';
import { cache, CACHE_KEYS, CACHE_TTL } from './cache';
import { performanceMonitor, measureAsync } from './performance';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      cache: useCache = true,
      cacheKey,
      cacheTTL,
      timeout = 10000
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestCacheKey = cacheKey || `${method}:${url}`;

    // Check cache for GET requests
    if (useCache && method === 'GET') {
      const cachedData = cache.get<T>(requestCacheKey);
      if (cachedData) {
        return { success: true, data: cachedData };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const startTime = performance.now();
      
      const response = await fetch(url, {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        credentials: 'include'
      });

      const endTime = performance.now();
      performanceMonitor.measureApiCall(url, startTime, endTime);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET requests
      if (useCache && method === 'GET' && data.success) {
        cache.set(requestCacheKey, data.data || data, cacheTTL);
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return measureAsync(
      'api_get',
      () => this.makeRequest<T>(endpoint, { ...options, method: 'GET' }),
      endpoint
    );
  }

  async post<T>(endpoint: string, body?: any, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return measureAsync(
      'api_post',
      () => this.makeRequest<T>(endpoint, { ...options, method: 'POST', body }),
      endpoint
    );
  }

  async put<T>(endpoint: string, body?: any, options: Omit<ApiOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return measureAsync(
      'api_put',
      () => this.makeRequest<T>(endpoint, { ...options, method: 'PUT', body }),
      endpoint
    );
  }

  async delete<T>(endpoint: string, options: Omit<ApiOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return measureAsync(
      'api_delete',
      () => this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' }),
      endpoint
    );
  }

  // Invalidate cache for specific patterns
  invalidateCache(pattern: string): void {
    cache.clear(); // For simplicity, clear all cache
  }
}

// Global API client instance
export const apiClient = new ApiClient();

// Specialized API functions with caching
export const coursesApi = {
  async getAll() {
    return apiClient.get(CACHE_KEYS.COURSES, {
      cacheKey: CACHE_KEYS.COURSES,
      cacheTTL: CACHE_TTL.COURSES
    });
  },

  async getById(id: string) {
    return apiClient.get(`/api/courses/${id}`, {
      cacheKey: CACHE_KEYS.COURSE_DETAIL(id),
      cacheTTL: CACHE_TTL.COURSE_DETAIL
    });
  },

  async getContent(courseId: string) {
    return apiClient.get(`/api/courses/${courseId}/content`, {
      cacheKey: CACHE_KEYS.COURSE_CONTENT(courseId),
      cacheTTL: CACHE_TTL.COURSE_CONTENT
    });
  },

  async getProgress(courseId: string) {
    return apiClient.get(`/api/courses/${courseId}/progress`, {
      cacheKey: CACHE_KEYS.COURSE_PROGRESS(courseId),
      cacheTTL: CACHE_TTL.COURSE_PROGRESS
    });
  },

  async getTutors() {
    return apiClient.get('/api/courses/tutors', {
      cacheKey: CACHE_KEYS.TUTORS,
      cacheTTL: CACHE_TTL.TUTORS
    });
  }
};

export const userApi = {
  async getProfile(userId: string) {
    return apiClient.get(`/api/user/${userId}`, {
      cacheKey: CACHE_KEYS.USER_PROFILE(userId),
      cacheTTL: CACHE_TTL.USER_PROFILE
    });
  },

  async updateProfile(userId: string, data: any) {
    const result = await apiClient.put(`/api/user/${userId}`, data);
    if (result.success) {
      cache.delete(CACHE_KEYS.USER_PROFILE(userId));
    }
    return result;
  }
};

// React hook for API calls with loading states
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
