import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking user session...');
    
    const session = await getServerSession(authOptions);
    
    console.log('Session details:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      userName: session?.user?.name
    });
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found - user not logged in',
        step: 'session_check'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'User is logged in',
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      },
      step: 'session_found'
    });
    
  } catch (error: any) {
    console.error('Session check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Session check failed',
      details: error.message,
      step: 'session_error'
    }, { status: 500 });
  }
}
