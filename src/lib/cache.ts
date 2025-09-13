// Simple in-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  COURSES: 'courses',
  COURSE_DETAIL: (id: string) => `course-${id}`,
  COURSE_CONTENT: (id: string) => `course-content-${id}`,
  COURSE_PROGRESS: (id: string) => `course-progress-${id}`,
  TUTORS: 'tutors',
  USER_PROFILE: (id: string) => `user-${id}`,
} as const;

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  COURSES: 10 * 60 * 1000, // 10 minutes
  COURSE_DETAIL: 15 * 60 * 1000, // 15 minutes
  COURSE_CONTENT: 30 * 60 * 1000, // 30 minutes
  COURSE_PROGRESS: 5 * 60 * 1000, // 5 minutes
  TUTORS: 60 * 60 * 1000, // 1 hour
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
} as const;

// Utility functions
export function getCachedData<T>(key: string): T | null {
  return cache.get<T>(key);
}

export function setCachedData<T>(key: string, data: T, ttl?: number): void {
  cache.set(key, data, ttl);
}

export function invalidateCache(pattern: string): void {
  for (const key of cache['cache'].keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
