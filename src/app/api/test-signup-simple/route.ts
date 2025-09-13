import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        dbError: dbError.message,
        dbErrorCode: dbError.code
      }, { status: 500 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        profile: {
          create: {
            bio: '',
            phone: '',
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

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      stack: error.stack
    }, { status: 500 });
  }
}
