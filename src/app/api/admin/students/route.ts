import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    
    // Fetch all students with their course enrollments
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      include: {
        studentEnrollments: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            courseId: true,
            tutorId: true,
            enrolledAt: true,
            paymentStatus: true
          }
        },
        profile: {
          select: {
            phone: true,
            whatsapp: true,
            bio: true,
            experience: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include course and tutor information
    const transformedStudents = students.map(student => {
      const enrolledCourses = student.studentEnrollments.map(enrollment => enrollment.courseId);
      const totalEnrollments = student.studentEnrollments.length;
      
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        enrolledCourses,
        totalEnrollments,
        profile: student.profile
      };
    });

    return NextResponse.json({
      success: true,
      students: transformedStudents,
      total: transformedStudents.length
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, whatsapp, bio, experience } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password' },
        { status: 400 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the student user
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT'
      }
    });

    // Create profile if additional information is provided
    if (phone || whatsapp || bio || experience) {
      await prisma.profile.create({
        data: {
          userId: student.id,
          phone: phone || null,
          whatsapp: whatsapp || null,
          bio: bio || null,
          experience: experience || null
        }
      });
    }

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role
      },
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create student',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
