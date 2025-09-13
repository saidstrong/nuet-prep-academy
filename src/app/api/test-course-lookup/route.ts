import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Course Lookup');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Test course lookup
    const courseId = 'cmf6zxwj60001xum8pnemsq8v';
    console.log('Testing course lookup for:', courseId);
    
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

    return NextResponse.json({ 
      success: true, 
      message: 'Course lookup successful!',
      course: course
    });

  } catch (error: any) {
    console.error('Course Lookup Test Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
