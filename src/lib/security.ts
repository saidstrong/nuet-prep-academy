import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  
  return response;
}

// Rate limiting
export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

// Authentication middleware
export async function requireAuth(request: NextRequest): Promise<{ user: any } | NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return { user: session.user };
}

// Role-based access control
export async function requireRole(roles: string[], request: NextRequest): Promise<{ user: any } | NextResponse> {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  if (!roles.includes(authResult.user.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return authResult;
}

// Input validation middleware
export function validateInput<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);
      
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: result.error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      
      return { data: result.data };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }
  };
}

// CSRF protection
export function validateCSRF(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const expectedOrigin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // Allow same-origin requests
  if (origin === expectedOrigin || referer?.startsWith(expectedOrigin)) {
    return true;
  }
  
  // Allow requests from Vercel preview URLs
  if (origin?.includes('vercel.app') || referer?.includes('vercel.app')) {
    return true;
  }
  
  return false;
}

// SQL injection protection
export function sanitizeQuery(query: string): string {
  // Remove potentially dangerous characters
  return query
    .replace(/[;'"]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
}

// XSS protection
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// File upload validation
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large' };
  }
  
  return { valid: true };
}

// IP-based rate limiting
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Security logging
export function logSecurityEvent(event: string, details: any, request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(`🔒 Security Event: ${event}`, {
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    details
  });
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
