import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular',
    width,
    height,
    lines = 1,
    ...props 
  }, ref) => {
    const baseClasses = "animate-pulse bg-slate-200 rounded";
    
    const variants = {
      text: "h-4",
      rectangular: "h-4",
      circular: "rounded-full"
    };
    
    const style = {
      width: width || (variant === 'circular' ? '40px' : '100%'),
      height: height || (variant === 'circular' ? '40px' : '16px')
    };

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(baseClasses, variants[variant])}
              style={{
                width: index === lines - 1 ? '75%' : '100%',
                height: height || '16px'
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// Pre-built skeleton components
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4 p-6", className)}>
    <Skeleton variant="rectangular" height="20px" width="60%" />
    <Skeleton variant="text" lines={3} />
    <div className="flex space-x-2">
      <Skeleton variant="rectangular" height="32px" width="80px" />
      <Skeleton variant="rectangular" height="32px" width="100px" />
    </div>
  </div>
);

const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={cn("space-y-3", className)}>
    {/* Header */}
    <div className="flex space-x-4">
      <Skeleton variant="rectangular" height="20px" width="25%" />
      <Skeleton variant="rectangular" height="20px" width="25%" />
      <Skeleton variant="rectangular" height="20px" width="25%" />
      <Skeleton variant="rectangular" height="20px" width="25%" />
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex space-x-4">
        <Skeleton variant="rectangular" height="16px" width="25%" />
        <Skeleton variant="rectangular" height="16px" width="25%" />
        <Skeleton variant="rectangular" height="16px" width="25%" />
        <Skeleton variant="rectangular" height="16px" width="25%" />
      </div>
    ))}
  </div>
);

const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <Skeleton 
      variant="circular" 
      className={cn(sizes[size], className)} 
    />
  );
};

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonAvatar };
