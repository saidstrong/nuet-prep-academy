import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    
    // Check if DATABASE_URL contains the correct port
    const hasCorrectPort = databaseUrl?.includes(':6543');
    const hasPooler = databaseUrl?.includes('pgbouncer=true');
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      databaseUrl: databaseUrl ? `${databaseUrl.substring(0, 50)}...` : 'NOT SET',
      nextAuthUrl: nextAuthUrl || 'NOT SET',
      nextAuthSecret: nextAuthSecret ? 'SET' : 'NOT SET',
      hasCorrectPort,
      hasPooler,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error checking environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
