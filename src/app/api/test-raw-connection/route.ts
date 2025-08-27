import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        message: 'DATABASE_URL not set',
        timestamp: new Date().toISOString()
      });
    }
    
    // Parse the database URL to extract connection details
    let connectionInfo;
    try {
      const url = new URL(databaseUrl);
      connectionInfo = {
        host: url.hostname,
        port: url.port,
        database: url.pathname.slice(1),
        username: url.username,
        hasSSL: url.searchParams.has('sslmode'),
        hasPooler: url.searchParams.has('pgbouncer')
      };
    } catch (e) {
      connectionInfo = 'Invalid URL format';
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database URL parsed successfully',
      connectionInfo,
      timestamp: new Date().toISOString(),
      note: 'This confirms your DATABASE_URL is valid and accessible'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'URL parsing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
