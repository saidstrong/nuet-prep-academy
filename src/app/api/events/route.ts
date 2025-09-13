import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Sample events data
    const events = [
      {
        id: '1',
        title: 'Mathematics Test',
        type: 'TEST',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00 AM',
        course: 'Advanced Mathematics',
        priority: 'HIGH',
        isCompleted: false
      },
      {
        id: '2',
        title: 'Physics Assignment Due',
        type: 'DEADLINE',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:59 PM',
        course: 'Physics Fundamentals',
        priority: 'MEDIUM',
        isCompleted: false
      },
      {
        id: '3',
        title: 'Live Q&A Session',
        type: 'LIVE_SESSION',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '2:00 PM',
        course: 'Chemistry Basics',
        priority: 'LOW',
        isCompleted: false
      },
      {
        id: '4',
        title: 'Calculus Quiz',
        type: 'TEST',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '9:00 AM',
        course: 'Advanced Mathematics',
        priority: 'HIGH',
        isCompleted: true
      }
    ];

    return NextResponse.json({
      success: true,
      events: events
    });

  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}