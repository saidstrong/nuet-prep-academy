"use client";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '100vw',
  quality = 75,
  fill = false,
  objectFit = 'cover',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageProps = {
    ref: imgRef,
    src: isInView ? src : undefined,
    alt,
    width: fill ? undefined : width,
    height: fill ? undefined : height,
    className: cn(
      'transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0',
      fill && 'absolute inset-0 w-full h-full',
      className
    ),
    style: fill ? { objectFit } : undefined,
    onLoad: handleLoad,
    onError: handleError,
    loading: (priority ? 'eager' : 'lazy') as 'eager' | 'lazy',
    decoding: 'async' as const
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-slate-200 flex items-center justify-center text-slate-500',
          fill ? 'absolute inset-0' : '',
          className
        )}
        style={fill ? { objectFit } : { width, height }}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative', fill ? 'w-full h-full' : '')}>
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-slate-200 animate-pulse',
            placeholder === 'blur' && blurDataURL && 'blur-sm'
          )}
          style={fill ? { objectFit } : { width, height }}
        >
          {placeholder === 'blur' && blurDataURL && (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(10px)' }}
            />
          )}
        </div>
      )}

      {/* Main Image */}
      <img {...imageProps} />
    </div>
  );
};

export default OptimizedImage;
