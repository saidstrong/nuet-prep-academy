"use client";
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };
  
  const gridCols = `grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  
  return (
    <div
      className={cn(
        'grid',
        gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
