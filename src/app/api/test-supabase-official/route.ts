import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing official Supabase connection format...');
    
    // Try the OFFICIAL Supabase connection format
    // This should be the format they provide in their dashboard
    const { PrismaClient } = await import('@prisma/client');
    
    // Official Supabase connection format (from their dashboard)
    // This should use their official connection pooler
    const officialUrl = "postgresql://postgres.mokrzgcbweenzmxlkcoo:Saltanat_1980_@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=20";
    
    console.log('🔗 Testing official connection:', officialUrl.substring(0, 50) + '...');
    
    // Create a new Prisma client with official connection
    const officialPrisma = new PrismaClient({
      datasources: {
        db: {
          url: officialUrl,
        },
      },
      log: ['error'],
    });
    
    try {
      // Test connection
      await officialPrisma.$connect();
      console.log('✅ Official Supabase connection successful!');
      
      // Try a simple query
      const result = await officialPrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Official Supabase connection working!',
        databaseInfo: result,
        connectionType: 'Official Pooler (port 6543)',
        user: 'postgres.mokrzgcbweenzmxlkcoo',
        timestamp: new Date().toISOString(),
        note: 'Official connection works - now we can create tables and seed data!'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Official Supabase connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Official Supabase connection failed',
        error: connectionError.message,
        connectionType: 'Official Pooler (port 6543)',
        user: 'postgres.mokrzgcbweenzmxlkcoo',
        timestamp: new Date().toISOString(),
        note: 'Official connection failed - need to check Supabase dashboard for correct format'
      });
    } finally {
      await officialPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Official connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Official connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
