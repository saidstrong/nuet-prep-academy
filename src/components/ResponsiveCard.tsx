"use client";
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export default function ResponsiveCard({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  onClick
}: ResponsiveCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        hoverClasses,
        clickableClasses,
        className
      )}
    >
      {children}
    </div>
  );
}
