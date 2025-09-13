import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 REST Enrollment API called');

    const body = await request.json();
    const { courseId, userEmail } = body;

    if (!courseId || !userEmail) {
      return NextResponse.json(
        { error: 'Course ID and user email are required' },
        { status: 400 }
      );
    }

    console.log('Enrollment request:', { courseId, userEmail });

    // Use Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Find user by email
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${userEmail}&select=id,email,role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`User lookup failed: ${userResponse.statusText}`);
    }

    const users = await userResponse.json();
    if (users.length === 0) {
      console.log('User not found:', userEmail);
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('Found user:', user);

    if (user.role !== 'STUDENT') {
      console.log('User is not a student:', user.role);
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    // Check if course exists
    const courseResponse = await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${courseId}&select=id,title,creatorId,isActive`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!courseResponse.ok) {
      throw new Error(`Course lookup failed: ${courseResponse.statusText}`);
    }

    const courses = await courseResponse.json();
    if (courses.length === 0) {
      console.log('Course not found:', courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courses[0];
    console.log('Found course:', course);

    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const enrollmentResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?studentId=eq.${user.id}&courseId=eq.${courseId}&select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!enrollmentResponse.ok) {
      throw new Error(`Enrollment check failed: ${enrollmentResponse.statusText}`);
    }

    const existingEnrollments = await enrollmentResponse.json();
    if (existingEnrollments.length > 0) {
      console.log('Already enrolled');
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollmentData = {
      id: `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      studentId: user.id,
      courseId: courseId,
      status: 'ACTIVE',
      tutorId: course.creatorId || user.id // Use course creator or fallback to student
    };

    console.log('Creating enrollment:', enrollmentData);

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(enrollmentData)
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Enrollment creation failed: ${createResponse.statusText} - ${errorText}`);
    }

    const enrollment = await createResponse.json();
    console.log('Enrollment created successfully:', enrollment);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in course!', 
      enrollment: {
        id: enrollment[0]?.id,
        courseTitle: course.title,
        enrolledAt: enrollment[0]?.enrolledAt || new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('REST Enrollment API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enroll in course', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
