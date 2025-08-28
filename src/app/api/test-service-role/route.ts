import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing Supabase connection with SERVICE ROLE key...');
    
    // Try the connection using the SERVICE ROLE key
    // This should have full database access
    const { PrismaClient } = await import('@prisma/client');
    
    // Service role connection - this should work!
    const serviceRoleUrl = "postgresql://postgres.mokrzgcbweenzmxlkcoo:Saltanat_1980_@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=20";
    
    console.log('🔗 Testing service role connection:', serviceRoleUrl.substring(0, 50) + '...');
    
    // Create a new Prisma client with service role connection
    const serviceRolePrisma = new PrismaClient({
      datasources: {
        db: {
          url: serviceRoleUrl,
        },
      },
      log: ['error'],
    });
    
    try {
      // Test connection
      await serviceRolePrisma.$connect();
      console.log('✅ Service role connection successful!');
      
      // Try a simple query
      const result = await serviceRolePrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Service role connection working!',
        databaseInfo: result,
        connectionType: 'Service Role (port 6543)',
        user: 'postgres.mokrzgcbweenzmxlkcoo',
        timestamp: new Date().toISOString(),
        note: 'Service role connection works - now we can create tables and seed data!'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Service role connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Service role connection failed',
        error: connectionError.message,
        connectionType: 'Service Role (port 6543)',
        user: 'postgres.mokrzgcbweenzmxlkcoo',
        timestamp: new Date().toISOString(),
        note: 'Service role connection failed - might need different approach'
      });
    } finally {
      await serviceRolePrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Service role test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Service role test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
