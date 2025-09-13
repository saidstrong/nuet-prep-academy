import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    icon,
    iconPosition = 'left',
    children, 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
      secondary: "bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 shadow-sm",
      outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-blue-500",
      ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
      destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm"
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    };
    
    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
      xl: "w-6 h-6"
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent mr-2", iconSizes[size])} />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className={cn("mr-2", iconSizes[size])}>
            {icon}
          </span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className={cn("ml-2", iconSizes[size])}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
