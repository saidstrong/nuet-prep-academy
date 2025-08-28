import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');

    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR',
      },
      include: {
        profile: {
          select: {
            id: true,
            bio: true,
            phone: true,
            avatar: true,
            whatsapp: true,
            experience: true,
          },
        },
        tutorEnrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        assignedCourses: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      tutors,
    });

  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while fetching tutors',
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, bio, phone, whatsapp, experience } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists',
      }, { status: 400 });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    const tutor = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TUTOR',
        profile: {
          create: {
            bio: bio || '',
            phone: phone || '',
            whatsapp: whatsapp || '',
            experience: experience || '',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password from response
    const { password: _, ...tutorWithoutPassword } = tutor;

    return NextResponse.json({
      success: true,
      message: 'Tutor created successfully',
      tutor: tutorWithoutPassword,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tutor:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while creating the tutor',
    }, { status: 500 });
  }
}
