"use client";
import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Skeleton } from './Skeleton';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  skeleton?: boolean;
  height?: string | number;
  width?: string | number;
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: LazyWrapperProps = {}
) {
  const LazyComponent = lazy(() => 
    Promise.resolve({ default: Component })
  );

  return function LazyWrapper(props: P) {
    const { fallback, skeleton, height, width } = options;
    
    let fallbackComponent = fallback;
    
    if (skeleton) {
      fallbackComponent = (
        <Skeleton 
          height={height} 
          width={width}
          className="w-full"
        />
      );
    } else if (!fallback) {
      fallbackComponent = (
        <div 
          className="flex items-center justify-center p-8"
          style={{ height, width }}
        >
          <LoadingSpinner text="Loading..." />
        </div>
      );
    }

    return (
      <Suspense fallback={fallbackComponent}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Hook for intersection observer-based lazy loading
export function useLazyLoad(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}

// Lazy load component with intersection observer
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  height?: string | number;
  width?: string | number;
}

export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  height,
  width
}: LazyLoadProps) {
  const { ref, isVisible } = useLazyLoad(threshold, rootMargin);

  return (
    <div ref={ref} style={{ height, width }}>
      {isVisible ? children : (fallback || <Skeleton height={height} width={width} />)}
    </div>
  );
}

// Preload component for critical components
export function preloadComponent(importFn: () => Promise<{ default: ComponentType<any> }>) {
  const componentPromise = importFn();
  
  // Preload the component
  componentPromise.catch(() => {
    // Silently handle preload errors
  });
  
  return componentPromise;
}

// Lazy load with preloading
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyWrapperProps = {}
) {
  const LazyComponent = lazy(importFn);
  
  // Preload the component
  preloadComponent(importFn);

  return function LazyWrapper(props: P) {
    const { fallback, skeleton, height, width } = options;
    
    let fallbackComponent = fallback;
    
    if (skeleton) {
      fallbackComponent = (
        <Skeleton 
          height={height} 
          width={width}
          className="w-full"
        />
      );
    } else if (!fallback) {
      fallbackComponent = (
        <div 
          className="flex items-center justify-center p-8"
          style={{ height, width }}
        >
          <LoadingSpinner text="Loading..." />
        </div>
      );
    }

    return (
      <Suspense fallback={fallbackComponent}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
