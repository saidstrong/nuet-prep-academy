import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔑 Showing correct connection string...');
    
    // Show the correct connection strings with the proper password
    const correctPassword = 'Saltanat_1980_';
    
    const connectionStrings = {
      pooler: `postgresql://postgres:${correctPassword}@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&pool_timeout=20`,
      direct: `postgresql://postgres:${correctPassword}@db.mokrzgcbweenzmxlkcoo.supabase.co:5432/postgres?sslmode=require`,
      note: 'Use the pooler version for Vercel DATABASE_URL'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Correct connection strings with proper password',
      password: correctPassword,
      connectionStrings,
      instructions: [
        '1. Go to Vercel Dashboard → Project Settings → Environment Variables',
        '2. Find DATABASE_URL and click Edit',
        '3. Replace with the pooler connection string above',
        '4. Save and redeploy your project'
      ],
      timestamp: new Date().toISOString(),
      note: 'The underscore at the end of your password was missing!'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to show connection strings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
