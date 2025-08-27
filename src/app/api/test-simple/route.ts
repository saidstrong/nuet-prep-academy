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
    
    // Check for any environment variables
    const allEnvVars = Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('NEXT') || 
      key.includes('SUPABASE')
    );
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check - Debug mode',
      databaseUrl: databaseUrl ? `${databaseUrl.substring(0, 50)}...` : 'NOT SET',
      nextAuthUrl: nextAuthUrl || 'NOT SET',
      nextAuthSecret: nextAuthSecret ? 'SET' : 'NOT SET',
      hasCorrectPort,
      hasPooler,
      allDatabaseRelatedVars: allEnvVars,
      timestamp: new Date().toISOString(),
      deployment: 'Debug mode - checking all env vars'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error checking environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
