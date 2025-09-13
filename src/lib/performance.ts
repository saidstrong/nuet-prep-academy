import React from 'react';

// Performance monitoring utilities
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window;
  }

  // Measure page load performance
  measurePageLoad(): void {
    if (!this.isEnabled) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
      this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      this.recordMetric('first_byte', navigation.responseStart - navigation.requestStart);
    }
  }

  // Measure API response times
  measureApiCall(url: string, startTime: number, endTime: number): void {
    if (!this.isEnabled) return;

    const duration = endTime - startTime;
    this.recordMetric('api_call', duration, url);
  }

  // Measure component render time
  measureComponentRender(componentName: string, startTime: number, endTime: number): void {
    if (!this.isEnabled) return;

    const duration = endTime - startTime;
    this.recordMetric('component_render', duration, componentName);
  }

  // Record custom metrics
  recordMetric(name: string, value: number, context?: string): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow operations
    if (value > 1000) { // More than 1 second
      console.warn(`Slow operation detected: ${name} took ${value}ms`, context);
    }
  }

  // Get Web Vitals
  getWebVitals(): Promise<WebVitals> {
    return new Promise((resolve) => {
      if (!this.isEnabled) {
        resolve({});
        return;
      }

      const vitals: WebVitals = {};

      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        vitals.FCP = fcpEntry.startTime;
      }

      // Largest Contentful Paint
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        vitals.LCP = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // First Input Delay
      const fidEntries = performance.getEntriesByType('first-input');
      if (fidEntries.length > 0) {
        const fidEntry = fidEntries[0] as any;
        vitals.FID = fidEntry.processingStart - fidEntry.startTime;
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsEntries = performance.getEntriesByType('layout-shift');
      for (const entry of clsEntries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      vitals.CLS = clsValue;

      resolve(vitals);
    });
  }

  // Get performance summary
  getPerformanceSummary(): {
    averagePageLoad: number;
    averageApiCall: number;
    slowestOperations: PerformanceMetric[];
    webVitals: WebVitals;
  } {
    const pageLoadMetrics = this.metrics.filter(m => m.name === 'page_load_time');
    const apiCallMetrics = this.metrics.filter(m => m.name === 'api_call');
    
    const averagePageLoad = pageLoadMetrics.length > 0 
      ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length 
      : 0;

    const averageApiCall = apiCallMetrics.length > 0 
      ? apiCallMetrics.reduce((sum, m) => sum + m.value, 0) / apiCallMetrics.length 
      : 0;

    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      averagePageLoad,
      averageApiCall,
      slowestOperations,
      webVitals: {} // Will be populated by getWebVitals()
    };
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export function measureAsync<T>(
  name: string,
  asyncFn: () => Promise<T>,
  context?: string
): Promise<T> {
  const startTime = performance.now();
  
  return asyncFn().finally(() => {
    const endTime = performance.now();
    performanceMonitor.recordMetric(name, endTime - startTime, context);
  });
}

export function measureSync<T>(
  name: string,
  syncFn: () => T,
  context?: string
): T {
  const startTime = performance.now();
  const result = syncFn();
  const endTime = performance.now();
  
  performanceMonitor.recordMetric(name, endTime - startTime, context);
  return result;
}

// React hook for measuring component performance
export function usePerformanceMeasure(componentName: string) {
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = performance.now();
  }, []);

  React.useEffect(() => {
    const endTime = performance.now();
    performanceMonitor.recordMetric('component_render', endTime - startTime.current, componentName);
  });
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Measure page load
  window.addEventListener('load', () => {
    performanceMonitor.measurePageLoad();
  });

  // Measure Web Vitals
  performanceMonitor.getWebVitals().then(vitals => {
    console.log('Web Vitals:', vitals);
  });
}
