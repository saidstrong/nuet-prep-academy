import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get environment variables to see what's configured
    const databaseUrl = process.env.DATABASE_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    // Check if we can parse the database URL
    let dbInfo = 'Not set';
    if (databaseUrl) {
      try {
        const url = new URL(databaseUrl);
        dbInfo = {
          host: url.hostname,
          port: url.port,
          database: url.pathname.slice(1),
          username: url.username
        };
      } catch (e) {
        dbInfo = 'Invalid URL format';
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment check successful',
      databaseInfo: dbInfo,
      nextAuthUrl: nextAuthUrl || 'Not set',
      timestamp: new Date().toISOString(),
      note: 'This shows your current configuration without database queries'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Environment check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
