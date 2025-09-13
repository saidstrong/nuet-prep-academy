import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// User validation schemas
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Course validation schemas
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  instructor: z.string().min(2, 'Instructor name must be at least 2 characters').max(50, 'Instructor name must be less than 50 characters'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedHours: z.number().min(1, 'Estimated hours must be at least 1').max(1000, 'Estimated hours must be less than 1000'),
  price: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price must be less than 1,000,000'),
  duration: z.string().min(1, 'Duration is required').max(50, 'Duration must be less than 50 characters'),
  maxStudents: z.number().min(1, 'Max students must be at least 1').max(1000, 'Max students must be less than 1000'),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional()
});

// Profile validation schemas
export const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: phoneSchema.optional(),
  whatsapp: phoneSchema.optional(),
  experience: z.string().max(1000, 'Experience must be less than 1000 characters').optional(),
  specialization: z.string().max(100, 'Specialization must be less than 100 characters').optional()
});

// Enrollment validation schemas
export const enrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  tutorId: z.string().min(1, 'Tutor ID is required'),
  paymentMethod: z.enum(['KASPI', 'CARD', 'BANK_TRANSFER', 'CONTACT_MANAGER', 'MANUAL']).optional()
});

// Utility functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.errors.map(error => {
    const path = error.path.join('.');
    return `${path}: ${error.message}`;
  });
}

// Rate limiting helper
export function createRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier}`;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// XSS protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
