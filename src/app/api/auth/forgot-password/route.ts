import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email address',
        errors: validationResult.error.errors
      }, { status: 400 });
    }

    const { email } = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // In a real application, you would generate a reset token and send an email here
    // For now, we'll just return success
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset link would be: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=RESET_TOKEN`);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred. Please try again.'
    }, { status: 500 });
  }
}
