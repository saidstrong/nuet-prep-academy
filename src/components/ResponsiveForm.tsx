"use client";
import { ReactNode, FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveFormProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export default function ResponsiveForm({
  children,
  onSubmit,
  className = '',
  spacing = 'md'
}: ResponsiveFormProps) {
  const spacingClasses = {
    sm: 'space-y-3 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  };
  
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </form>
  );
}

interface ResponsiveInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ResponsiveInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = ''
}: ResponsiveInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 text-base border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          'min-h-[48px]', // Minimum touch target
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

interface ResponsiveTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function ResponsiveTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = ''
}: ResponsiveTextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 text-base border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          'resize-vertical min-h-[120px]',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
