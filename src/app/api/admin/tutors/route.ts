import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Fetch all tutors with their course assignments and student counts
    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      include: {
        tutorEnrollments: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            course: {
              select: {
                id: true,
                title: true
              }
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data for the dashboard
    const transformedTutors = tutors.map(tutor => {
      // Get unique assigned courses
      const assignedCourses = [...new Set(tutor.tutorEnrollments.map(enrollment => enrollment.course.id))];
      
      // Count total students across all courses
      const totalStudents = tutor.tutorEnrollments.length;
      
      // Get course details
      const courseDetails = tutor.tutorEnrollments.map(enrollment => ({
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        studentCount: 1 // Each enrollment represents one student
      }));

      return {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        role: tutor.role,
        assignedCourses: assignedCourses,
        totalStudents,
        courseDetails,
        createdAt: tutor.createdAt,
        updatedAt: tutor.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      tutors: transformedTutors,
      total: transformedTutors.length
    });

  } catch (error) {
    console.error('Error fetching admin tutors:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tutors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
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
