import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    console.log('Admin students API: Fetching students...');
    
    // Get students (simplified query to avoid relation issues)
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            phone: true,
            whatsapp: true,
            bio: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Admin students API: Found ${students.length} students`);

    // Transform the data (simplified without enrollments for now)
    const transformedStudents = students.map(student => {
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        createdAt: student.createdAt,
        enrolledCourses: [], // Empty for now
        totalEnrollments: 0, // Zero for now
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
    
    if (!session || !['ADMIN'].includes(session.user.role)) {
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
    const bcrypt = await import('bcryptjs');
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
