import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing session passing...');
    
    // Get headers
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    
    console.log('Cookie header:', cookieHeader);
    
    // Try to get session
    const session = await getServerSession(authOptions);
    
    console.log('Session from getServerSession:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    });
    
    return NextResponse.json({
      success: true,
      session: session ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      } : null,
      hasCookie: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0
    });
    
  } catch (error: any) {
    console.error('Session test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
