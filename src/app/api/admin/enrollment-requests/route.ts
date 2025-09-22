import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Admin Enrollment Requests API called');

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Find user by email
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${session.user.email}&select=id,email,role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('User lookup failed');
    }

    const users = await userResponse.json();
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User found:', user);

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can view enrollment requests' },
        { status: 403 }
      );
    }

    // Get enrollment requests (simplified query)
    const enrollmentResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?select=id,status,paymentStatus,enrolledAt,updatedAt,studentId,courseId,tutorId`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!enrollmentResponse.ok) {
      const errorText = await enrollmentResponse.text();
      console.error('Enrollment fetch failed:', errorText);
      throw new Error(`Failed to fetch enrollment requests: ${enrollmentResponse.status} - ${errorText}`);
    }

    const enrollments = await enrollmentResponse.json();
    console.log('Enrollment requests fetched:', enrollments.length);

    // Get all users for student and tutor info
    const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,name,email`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users');
    }

    const allUsers = await usersResponse.json();
    const userMap = new Map(allUsers.map((user: any) => [user.id, user]));

    // Get all courses for course info
    const coursesResponse = await fetch(`${supabaseUrl}/rest/v1/courses?select=id,title,price`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!coursesResponse.ok) {
      throw new Error('Failed to fetch courses');
    }

    const courses = await coursesResponse.json();
    const courseMap = new Map(courses.map((course: any) => [course.id, course]));

    // Transform the data to include related information
    const transformedEnrollments = enrollments.map((enrollment: any) => {
      const student = userMap.get(enrollment.studentId) as any;
      const tutor = userMap.get(enrollment.tutorId) as any;
      const course = courseMap.get(enrollment.courseId) as any;

      return {
        id: enrollment.id,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        paymentMethod: 'CONTACT_MANAGER', // Default since column doesn't exist
        enrolledAt: enrollment.enrolledAt,
        updatedAt: enrollment.updatedAt,
        student: {
          id: enrollment.studentId,
          name: student?.name || 'Unknown',
          email: student?.email || 'Unknown'
        },
        course: {
          id: enrollment.courseId,
          title: course?.title || 'Unknown Course',
          price: course?.price || 0
        },
        tutor: {
          id: enrollment.tutorId,
          name: tutor?.name || 'Unknown',
          email: tutor?.email || 'Unknown'
        }
      };
    });

    return NextResponse.json({
      success: true,
      enrollments: transformedEnrollments
    });

  } catch (error: any) {
    console.error('Admin Enrollment Requests API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch enrollment requests', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
