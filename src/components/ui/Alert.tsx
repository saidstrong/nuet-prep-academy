import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  description?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default',
    title,
    description,
    showIcon = true,
    dismissible = false,
    onDismiss,
    children,
    ...props 
  }, ref) => {
    const baseClasses = "rounded-lg border p-4 transition-all duration-200";
    
    const variants = {
      default: "bg-slate-50 border-slate-200 text-slate-800",
      success: "bg-green-50 border-green-200 text-green-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      error: "bg-red-50 border-red-200 text-red-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    };
    
    const icons = {
      default: Info,
      success: CheckCircle,
      warning: AlertCircle,
      error: XCircle,
      info: Info
    };
    
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex items-start">
          {showIcon && (
            <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
          )}
          <div className="flex-1">
            {title && (
              <h4 className="font-medium mb-1">{title}</h4>
            )}
            {description && (
              <p className="text-sm opacity-90">{description}</p>
            )}
            {children}
          </div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className="ml-3 flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss alert"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert };
