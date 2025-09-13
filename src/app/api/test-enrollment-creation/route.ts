import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Enrollment Creation');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Test enrollment creation with known data
    const enrollmentData = {
      id: `test_enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: 'cmesvicua000013ec429esy6e', // owner@nuetprep.academy
      courseId: 'cmf6zxwj60001xum8pnemsq8v', // SAID course
      tutorId: 'cmezex1c0000092i32j6pev2k', // course creator
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'CONTACT_MANAGER'
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
      message: 'Enrollment creation successful!',
      enrollment: enrollment[0]
    });

  } catch (error: any) {
    console.error('Enrollment Creation Test Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
