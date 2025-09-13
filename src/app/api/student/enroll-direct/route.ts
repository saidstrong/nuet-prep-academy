import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('🔍 Direct Enrollment API called');

    const body = await request.json();
    const { courseId, userEmail } = body;

    if (!courseId || !userEmail) {
      return NextResponse.json(
        { error: 'Course ID and user email are required' },
        { status: 400 }
      );
    }

    console.log('Enrollment request:', { courseId, userEmail });

    client = await pool.connect();

    // Find user by email
    const userResult = await client.query(
      'SELECT id, email, role FROM "User" WHERE email = $1',
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      console.log('User not found:', userEmail);
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    console.log('Found user:', user);

    if (user.role !== 'STUDENT') {
      console.log('User is not a student:', user.role);
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    // Check if course exists
    const courseResult = await client.query(
      'SELECT id, title, "creatorId", "isActive" FROM "Course" WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      console.log('Course not found:', courseId);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];
    console.log('Found course:', course);

    if (!course.isActive) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const enrollmentResult = await client.query(
      'SELECT id FROM "CourseEnrollment" WHERE "studentId" = $1 AND "courseId" = $2',
      [user.id, courseId]
    );

    if (enrollmentResult.rows.length > 0) {
      console.log('Already enrolled');
      return NextResponse.json(
        { error: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollmentData = {
      studentId: user.id,
      courseId: courseId,
      status: 'ACTIVE',
      enrolledAt: new Date(),
      updatedAt: new Date(),
      ...(course.creatorId && { tutorId: course.creatorId })
    };

    console.log('Creating enrollment:', enrollmentData);

    const insertResult = await client.query(
      `INSERT INTO "CourseEnrollment" ("studentId", "courseId", "status", "enrolledAt", "updatedAt", "tutorId")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        enrollmentData.studentId,
        enrollmentData.courseId,
        enrollmentData.status,
        enrollmentData.enrolledAt,
        enrollmentData.updatedAt,
        enrollmentData.tutorId || null
      ]
    );

    const enrollmentId = insertResult.rows[0].id;
    console.log('Enrollment created successfully:', enrollmentId);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in course!', 
      enrollment: {
        id: enrollmentId,
        courseTitle: course.title,
        enrolledAt: enrollmentData.enrolledAt
      }
    });
  } catch (error: any) {
    console.error('Direct Enrollment API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enroll in course', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
