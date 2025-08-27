import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Debugging environment variables and connection...');
    
    // Get all environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    
    // Parse the database URL to show details
    let connectionDetails = 'Not set';
    let parsedUrl = null;
    
    if (databaseUrl) {
      try {
        parsedUrl = new URL(databaseUrl);
        connectionDetails = {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          username: parsedUrl.username,
          database: parsedUrl.pathname.slice(1),
          hasSSL: parsedUrl.searchParams.has('sslmode'),
          hasPooler: parsedUrl.searchParams.has('pgbouncer'),
          allParams: Object.fromEntries(parsedUrl.searchParams.entries())
        };
      } catch (e) {
        connectionDetails = 'Invalid URL format';
      }
    }
    
    // Check if we can reach the hostname (basic connectivity test)
    let connectivityTest = 'Not tested';
    if (parsedUrl) {
      try {
        // This is a basic test - we can't actually connect to the database
        // but we can show what we're trying to connect to
        connectivityTest = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          connectionType: parsedUrl.port === '6543' ? 'Pooler' : 'Direct',
          note: 'Vercel cannot reach this hostname/port'
        };
      } catch (e) {
        connectivityTest = 'Connectivity test failed';
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment debug information',
      environment: {
        hasDatabaseUrl: !!databaseUrl,
        hasNextAuthUrl: !!nextAuthUrl,
        hasNextAuthSecret: !!nextAuthSecret,
        nextAuthUrl: nextAuthUrl || 'NOT SET',
        nextAuthSecret: nextAuthSecret ? 'SET (hidden)' : 'NOT SET'
      },
      databaseConnection: {
        url: databaseUrl ? `${databaseUrl.substring(0, 50)}...` : 'NOT SET',
        parsedDetails: connectionDetails,
        connectivityTest
      },
      diagnosis: {
        issue: 'Vercel cannot reach Supabase database',
        possibleCauses: [
          'Supabase project is paused/suspended',
          'Network firewall blocking Vercel',
          'Supabase region restrictions',
          'Database credentials are wrong',
          'Supabase service is down'
        ],
        nextSteps: [
          'Check Supabase project status',
          'Verify database is running',
          'Check if credentials are correct',
          'Try different connection method'
        ]
      },
      timestamp: new Date().toISOString(),
      note: 'This shows your current configuration and possible issues'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
