import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Testing simple auth...');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'No session found',
        session: null 
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Session found',
      session: {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Auth test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST method works',
    timestamp: new Date().toISOString()
  });
}
