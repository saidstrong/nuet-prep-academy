import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const tutors = await prisma.user.findMany({
      where: {
        role: 'TUTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ tutors });
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, specialization, experience, bio, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Create user (profile will be handled separately if needed)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: 'temp-password', // Will need to be changed on first login
        role: role || 'TUTOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        assignedCourses: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json({ 
      tutor: user,
      message: 'Tutor created successfully' 
    });
  } catch (error) {
    console.error('Error creating tutor:', error);
    return NextResponse.json(
      { error: 'Failed to create tutor' },
      { status: 500 }
    );
  }
}