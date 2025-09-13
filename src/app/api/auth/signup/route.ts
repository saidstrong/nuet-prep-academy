import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema, validateInput, formatValidationErrors } from '@/lib/validation';
import { addSecurityHeaders, rateLimit, getClientIP, logSecurityEvent } from '@/lib/security';

export async function POST(request: Request) {
  const clientIP = getClientIP(request as any);
  
  // Rate limiting
  if (!rateLimit(clientIP, 5, 60000)) { // 5 attempts per minute
    logSecurityEvent('Rate limit exceeded', { ip: clientIP }, request as any);
    return addSecurityHeaders(NextResponse.json({
      success: false,
      message: 'Too many requests. Please try again later.'
    }, { status: 429 }));
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(signupSchema, body);
    if (!validation.success) {
      return addSecurityHeaders(NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(validation.errors)
      }, { status: 400 }));
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      logSecurityEvent('Signup attempt with existing email', { email, ip: clientIP }, request as any);
      return addSecurityHeaders(NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 400 }));
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT', // Default role for new users
        profile: {
          create: {
            bio: '',
            phone: '',
            whatsapp: '',
            experience: '',
            specialization: '',
            avatar: ''
          }
        }
      },
      include: {
        profile: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logSecurityEvent('User created successfully', { userId: user.id, email }, request as any);

    return addSecurityHeaders(NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 }));

  } catch (error: any) {
    console.error('Signup error:', error);
    logSecurityEvent('Signup error', { error: error.message, ip: clientIP }, request as any);
    
    return addSecurityHeaders(NextResponse.json({
      success: false,
      message: 'An error occurred during signup'
    }, { status: 500 }));
  }
}