import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
    
    const variants = {
      default: "bg-slate-100 text-slate-800 border border-slate-200",
      secondary: "bg-blue-100 text-blue-800 border border-blue-200",
      success: "bg-green-100 text-green-800 border border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      error: "bg-red-100 text-red-800 border border-red-200",
      info: "bg-cyan-100 text-cyan-800 border border-cyan-200",
      outline: "border border-slate-300 text-slate-700 bg-transparent"
    };
    
    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-sm",
      lg: "px-3 py-1.5 text-base"
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
