import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test direct connection first
    const directUrl = "postgresql://postgres.xqHm85xvEAqD6jx6@db.mokrzgcbweenzmxlkcoo.supabase.co:5432/postgres?sslmode=require";
    
    // Test pooler connection
    const poolerUrl = "postgresql://postgres.xqHm85xvEAqD6jx6@db.mokrzgcbweenzmxlkcoo.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=20";
    
    // Test current environment variable
    const currentUrl = process.env.DATABASE_URL;
    
    return NextResponse.json({
      success: true,
      message: 'Connection test endpoints',
      currentUrl: currentUrl ? `${currentUrl.substring(0, 50)}...` : 'NOT SET',
      directUrl: `${directUrl.substring(0, 50)}...`,
      poolerUrl: `${poolerUrl.substring(0, 50)}...`,
      timestamp: new Date().toISOString(),
      note: 'Try updating DATABASE_URL to use direct connection (port 5432) temporarily'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error in connection test',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
