import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Enrollment Request API called');

    const { courseId, tutorId, paymentMethod, userEmail } = await request.json();
    
    console.log('Request data:', { courseId, tutorId, paymentMethod, userEmail });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseKey: supabaseKey ? 'Set' : 'Missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Test user lookup
    console.log('Testing user lookup...');
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${userEmail}&select=id,email,role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User lookup failed:', errorText);
      return NextResponse.json(
        { error: 'User lookup failed', details: errorText },
        { status: 500 }
      );
    }

    const users = await userResponse.json();
    console.log('Users found:', users);

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User:', user);

    // Test course lookup
    console.log('Testing course lookup...');
    const courseResponse = await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${courseId}&select=id,title,creatorId,isActive`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Course response status:', courseResponse.status);
    
    if (!courseResponse.ok) {
      const errorText = await courseResponse.text();
      console.error('Course lookup failed:', errorText);
      return NextResponse.json(
        { error: 'Course lookup failed', details: errorText },
        { status: 500 }
      );
    }

    const courses = await courseResponse.json();
    console.log('Courses found:', courses);

    if (!courses || courses.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courses[0];
    console.log('Course:', course);

    // Test enrollment creation
    console.log('Testing enrollment creation...');
    const enrollmentData = {
      id: `test_enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: user.id,
      courseId: courseId,
      tutorId: tutorId || course.creatorId || user.id,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: paymentMethod || 'CONTACT_MANAGER'
    };

    console.log('Enrollment data:', enrollmentData);

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

    console.log('Create response status:', createResponse.status);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Enrollment creation failed:', errorText);
      return NextResponse.json(
        { error: 'Enrollment creation failed', details: errorText },
        { status: 500 }
      );
    }

    const enrollment = await createResponse.json();
    console.log('Enrollment created:', enrollment);

    return NextResponse.json({ 
      success: true, 
      message: 'Test enrollment request successful!',
      enrollment: enrollment[0]
    });

  } catch (error: any) {
    console.error('Test Enrollment Request API Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
