import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Enrollment Request API called');

    const { courseId, tutorId, paymentMethod, userEmail } = await request.json();
    
    if (!courseId || !userEmail) {
      return NextResponse.json(
        { error: 'Course ID and user email are required' },
        { status: 400 }
      );
    }

    console.log('Request data:', { courseId, tutorId, paymentMethod, userEmail });

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

    // Allow all users to create enrollment requests (remove role restriction for testing)
    // TODO: Add role restriction back if needed
    console.log('User role:', user.role);

    // Skip course validation for now to simplify debugging
    console.log('Skipping course validation for debugging');

    // Check if already enrolled or has pending request
    const enrollmentResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?studentId=eq.${user.id}&courseId=eq.${courseId}&select=id,status`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!enrollmentResponse.ok) {
      throw new Error('Enrollment check failed');
    }

    const existingEnrollments = await enrollmentResponse.json();
    console.log('Existing enrollments:', existingEnrollments);

    if (existingEnrollments && existingEnrollments.length > 0) {
      const existing = existingEnrollments[0];
      if (existing.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'You are already enrolled in this course' },
          { status: 400 }
        );
      } else if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: 'You already have a pending enrollment request for this course' },
          { status: 400 }
        );
      }
    }

    // Validate tutor ID - if it doesn't exist, use a default tutor
    let validTutorId = 'cmezex1c0000092i32j6pev2k'; // Default admin tutor
    
    if (tutorId && tutorId !== 'tutor1' && tutorId !== 'tutor2' && tutorId !== 'tutor3') {
      // Check if the provided tutor ID exists in the database
      const tutorResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${tutorId}&select=id,role`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (tutorResponse.ok) {
        const tutors = await tutorResponse.json();
        if (tutors && tutors.length > 0 && (tutors[0].role === 'TUTOR' || tutors[0].role === 'ADMIN')) {
          validTutorId = tutorId;
        }
      }
    }

    // Create enrollment request with PENDING status
    const enrollmentData = {
      id: `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: user.id,
      courseId: courseId,
      tutorId: validTutorId,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: paymentMethod || 'CONTACT_MANAGER'
    };

    console.log('Creating enrollment request:', enrollmentData);

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
      console.error('Enrollment creation failed:', errorText);
      throw new Error(`Enrollment creation failed: ${createResponse.status} - ${errorText}`);
    }

    const enrollment = await createResponse.json();
    console.log('Enrollment request created successfully:', enrollment);

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment request submitted successfully! Please contact the manager to complete payment.',
      enrollment: {
        id: enrollment[0]?.id,
        courseTitle: 'Course Title', // Simplified for debugging
        status: 'PENDING',
        paymentMethod: 'CONTACT_MANAGER' // Hardcoded for now
      }
    });

  } catch (error: any) {
    console.error('Enrollment Request API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit enrollment request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
