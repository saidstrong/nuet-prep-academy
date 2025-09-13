"use client";
import { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}